"use strict";

var Canvas = require('canvas')
var fs = require('fs')
var GIFEncoder = require('gifencoder')
var Image = require('canvas').Image

var Gif = require('lib/Gif').Gif
var GifManager = require('lib/Gif').GifManager


function load_gifs(data) {
    gifs = data
}

function create(base_image, done) {

    var canvas = new Canvas(500, 500)
    var context = canvas.getContext('2d')

    var gifs_config = {
        gif_init: function() {
            this.ready = true // Don't need to preload anything
            return this
        },
        gifs_capture: function(callback) {
            var encoder = new GIFEncoder(500, 500);

            encoder.createReadStream().pipe(fs.createWriteStream('my-votin-gif.gif'))

            encoder.start();
            encoder.setRepeat(0)
            encoder.setDelay(this.speed)
            encoder.setQuality(2)
            this.gif = encoder
        },
        gifs_draw: function() {
            if( this.frame < this.frames ) {
                this.gif.addFrame(context)
                this.frame += 1
            } else {
                this.frame = 0
                var gif = this.gif
                this.gif = null
                gif.finish()
                this.save_gif()
            }
        },
        context: context
    }

    require('list')
    gifs_config.gifs_save = function() { done(true); }
    var Gifs = new GifManager(gifs, gifs_config)

    Gifs.base_image = new Image
    Gifs.base_image.src = base_image
    Gifs.start_drawing()
    Gifs.capture()
}

module.exports.Create = create
module.exports.Load = load_gifs

