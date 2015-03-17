var exec = require('child_process').exec;
var fs = require('fs')
var path = require('path')

var glob = require('glob')
var rimraf = require('rimraf')
var s3 = require('s3')

var ProcessGif = require('lib/ProcessGif')

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        gif_lib: 'gifs/',
        gif_cache: 'cache/',
        gif_list: 'list.js',
        gif_special: ['squirrel'],
        'http-server': {
            'dev': {

                root: '.',
                port: 8282,
                host: "127.0.0.1",

                showDir : true,
                autoIndex: true,
                defaultExt: "html",

                runInBackground: false
            }
        }

    });

    grunt.registerTask('default', ['clense', 'process','list'])
    grunt.registerTask('serve', ['default','http-server'])
    grunt.registerTask('deploy', ['default','deploy_lib','deploy_styles','deploy_list', 'deploy_cache'])

    grunt.loadNpmTasks('grunt-http-server');

    grunt.registerTask('process', 'Process ALL the gifs', function() {
        var done = this.async()
        var gif_lib = grunt.config.get('gif_lib')

        glob(path.join(gif_lib,'*.gif'), {}, function(er, files) {
            grunt.option('raw_gifs', files)
            grunt.option('finished_gifs', [])
            grunt.log.ok('Processing '+files.length+' gifs')

            files.forEach( function(file, i) {
                grunt.task.run('process_gif:'+i)
            })
            done(true)
        })
    });
    grunt.registerTask('clense',
        'Blow away config.json and stored gis',
        function() {
            var done = this.async()

            var gif_cache = grunt.config.get('gif_cache')
            var gif_list = grunt.config.get('gif_list')

            fs.unlink(gif_list, function() {
                rimraf(gif_cache, function() {
                    fs.mkdir(gif_cache,function() {
                        grunt.log.ok('Clearking cache')
                        done(true)
                    })
                })
            })
        }
    )
    grunt.registerTask('list',
        'Catalog all the gifs into '+grunt.config.get('gif_list'),
        function() {
            var done = this.async()
            var list = grunt.option('finished_gifs')
            var gif_list = grunt.config.get('gif_list')

            fs.writeFile(gif_list,
                "load_gifs("+JSON.stringify(list)+")",
                function(err) {
                    grunt.log.ok('Writing '+grunt.config.get('gif_list'))
                    done(true)
                }
            )
        }
    )
    grunt.registerTask('process_gif', 'Process a specific gif', function() {
        var done = this.async()
        var gif_cache = grunt.config.get('gif_cache')
        var special = grunt.config.get('gif_special')

        var file = grunt.option('gif')

        if( !!! file ) {
            file = grunt.option('raw_gifs')[ this.args[0] ]
        }
        var finished_gifs = grunt.option('finished_gifs')

        var gif = new ProcessGif(file, gif_cache, function() {
            this.config.special = special.indexOf(this.name()) !== -1
            if( this.config.special ) grunt.log.ok(['And',
                                                    this.name(),
                                                    'is special'].join(' '))
            if( typeof finished_gifs !== 'undefined' )
                finished_gifs.push(this.config);
            done(true)
        })

        grunt.log.ok('Processing '+gif.name())

    });


    grunt.registerTask('create','Create gif from a static file', function() {
        var base_image = this.args[0] || grunt.option('static')
        var done = this.async()
        grunt.log.ok('Transforming '+base_image.split('/').reverse()[0])
        gifs = null
        load_gifs = require('lib/CreateGif').Load
        var create = require('lib/CreateGif').Create
        create(base_image, done)
    })

    grunt.registerTask('deploy_lib','Put all of the lib onto S3', function() {
        var done = this.async()
        upload_folder('lib', done)
    })
    grunt.registerTask('deploy_styles','Put all of the lib onto S3', function() {
        var done = this.async()
        upload_folder('styles', done)
    })
    grunt.registerTask('deploy_cache','Put all of the cache onto S3', function() {
        var done = this.async()
        upload_folder('cache', done)
    })
    grunt.registerTask('deploy_list','Put all the list on to S3', function() {
        upload_file(grunt.config.get('gif_list'), this.async())
    })
    grunt.registerTask('deploy_index','Put the index on to S3', function() {
        upload_file('index.html', this.async())
    })
    function upload_file(file, done) {
        var client = s3.createClient({
            s3Options: {
                accessKeyId: process.env.S3,
                secretAccessKey: process.env.S3_SECRET,
                region: 'us-west-2'
            }
        })

        var params = {
          localFile: file,
          deleteRemoved: true,
          s3Params: {
            Bucket: "nvrd",
            Key: file,
          }
        }

        var uploader = client.uploadFile(params)

        uploader.on('error', function(err) {
            console.error("unable to sync:", err.stack);
            done(false)
        });
        uploader.on('end', function() {
            grunt.log.ok('Saved list.js to amazon')
            done(true)
        });
    }
    function upload_folder(path, done) {
        var client = s3.createClient({
            s3Options: {
                accessKeyId: process.env.S3,
                secretAccessKey: process.env.S3_SECRET,
                region: 'us-west-2'
            }
        })

        var params = {
          localDir: path,
          deleteRemoved: true,
          s3Params: {
            Bucket: "nvrd",
            Prefix: path,
          }
        }

        var uploader = client.uploadDir(params)

        uploader.on('error', function(err) {
            console.error("unable to sync:", err.stack);
            done(false)
        });
        uploader.on('end', function() {
            grunt.log.ok('Saved '+path+' to amazon')
            done(true)
        });
    }
};

