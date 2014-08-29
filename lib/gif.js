var exec = require('child_process').exec;
var fs = require('fs')
var path = require('path')

function Gif(filename, storage, list, done) {
    this.filename = filename
    this.done = done
    this.storage = storage

    this.config = {
        'frames': 0,
        'height': 0,
        'width': 0,
    }


    // Helper functions
    this.name = function() {
        return (this.filename.split('/').reverse()[0]
                .replace('\.gif','').toLowerCase()) }
    this.storage_path = function() {
        return path.join(this.storage, this.name()) }
    this.sprite_path = function() {
        return path.join(this.storage_path(), this.name()+'_sprite.png')}

    // Step functions
    this.init = function() {
        return this.identify()
    }
    this.identify = function() {
        var cmnd = [
            'identify',
            this.filename,
        ].join(' ')

        exec(cmnd, function(err, stdin, stderr) {
            var output = stdin.split("\n")
            self.config.frames = output.length

            var size = output[0].split(" ")[3].split('+')[0].split('x')
            self.config.width = parseInt(size[0])
            self.config.height = parseInt(size[1])

            return self.cleanup()
        })
    }
    this.cleanup = function () {
        return this.configure()
    }
    this.configure = function() {

        fs.mkdir(this.storage_path(), function(e){
            var config_path = path.join(self.storage_path(), 'config.json')
            self.config = self.sprite_path()

            fs.writeFile(config_path,
                JSON.stringify(self.config),
                function(err) {
                    return self.montage()
                }
            )
        });
    }
    this.montage = function() {
        var cmnd = [
            "montage",
            this.filename,
            "-tile x1",
            "-geometry '1x1+0+0<'",
            "-alpha On",
            "-background transparent",
            "-quality 100 ",
            this.sprite_path(),
        ].join(' ')
        exec(cmnd, function(err, stdin, stderr) {
            return self.finish()
        })
    }
    this.finish = function() {
        list.push(this.config)
        this.done(true)
        return this
    }


    var self = this
    return self.init()
}

module.exports = Gif
