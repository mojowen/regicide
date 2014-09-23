"use strict";

var exec = require('child_process').exec;
var fs = require('fs')
var path = require('path')

function Gif(filename, storage, finish_callback) {
    this.filename = filename
    this.storage = storage

    this.config = {
        'frames': 0,
    }


    // Helper functions
    this.name = function() {
        return (this.filename.split('/').reverse()[0]
                .replace('\.gif','').toLowerCase()) }
    this.storage_path = function() {
        return path.join(this.storage, this.name()) }
    this.sprite_path = function() {
        return path.join(this.storage_path(), 'sprite.png')}

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

            self.config.frames = output
                .filter( function(el) {
                    return el.length > 1
                })
                .map(function(el) {
                    var size = el.split(' ')[2]
                    return { width: parseInt(size.split('x')[0]),
                             height: parseInt(size.split('x')[1]) }
                })

            self.config.height = self.config.frames.reduce(
                function(prev, el ) {
                    return el.height > prev.height ? el : prev
                }
            ).height
            self.config.width = self.config.frames.reduce(
                function(prev, el ) {
                    return el.width > prev.width ? el : prev
                }
            ).width

            return self.configure()
        })
    }
    this.configure = function() {

        fs.mkdir(this.storage_path(), function(e){
            var config_path = path.join(self.storage_path(), 'config.json')
            self.config.sprite_path = self.sprite_path()

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
            "-geometry '+0+0'",
            "-alpha On",
            "-background transparent",
            "-quality 100",
            this.sprite_path(),
        ].join(' ')
        exec(cmnd, function(err, stdin, stderr) {
            return self.finish()
        })
    }
    this.finish = function() {
        finish_callback = finish_callback || function() { return this }
        return finish_callback.call(this)
    }


    var self = this
    return self.init()
}

module.exports = Gif
