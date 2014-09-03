var exec = require('child_process').exec;
var fs = require('fs')
var path = require('path')

var glob = require('glob')
var rimraf = require('rimraf')

var Gif = require('lib/ProcessGif')

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        gif_lib: 'gifs/',
        gif_cache: 'cache/',
        gif_list: 'list.js',
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

    // Default task(s).
    grunt.registerTask('default', ['clense', 'process','list'])
    grunt.registerTask('serve', ['default', 'http-server'])

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

            fs.writeFile(gif_list, "load_gifs("+JSON.stringify(list)+")", function(err) {
                grunt.log.ok('Writing '+grunt.config.get('gif_list'))
                done(true)
            })
        }
    )
    grunt.registerTask('process_gif', 'Process a specific gif', function() {
        var done = this.async()
        var gif_cache = grunt.config.get('gif_cache')

        var file = grunt.option('gif')

        if( !!! file ) {
            file = grunt.option('raw_gifs')[ this.args[0] ]
        }
        var finished_gifs = grunt.option('finished_gifs')

        var gif = new Gif(file, gif_cache, finished_gifs, done)

        grunt.log.ok('Processed '+gif.name())

    });

    grunt.loadNpmTasks('grunt-http-server');
};
