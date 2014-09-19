"use strict";

if( typeof Image === 'undefined' ) {
    var Image = require('canvas').Image
}

function Gif (data, options) {
    this.ready = false
    this.frames = data.frames

    this.height = data.height
    this.width = data.width
    this.sprite_path = data.sprite_path
    this.position = data.position

    this.next_frame = 0

    var context = options.context

    this.init = function() {
        var init_callback = options.gif_init || function() { return this }

        return init_callback.call(this)
    }
    this.draw = function(frame) {
        var frame_number = (frame || this.next_frame) % this.frames.length
        var frame = this.frames[ frame_number ]

        var height = this.height
        var width = frame.width

        var base_image = new Image()
        base_image.src = this.sprite_path

        // define the frame
        var sourceX = (this.frames.slice(0, frame_number)
                       .map( function(frame) { return frame.width })
                       .reduce( function(prev, current){ return current + prev },
                            0))

        var sourceY = 0
        var sourceWidth = width
        var sourceHeight = height

        // position
        var destWidth = width
        var destHeight = height
        var destX = this.position.x
        var destY = this.position.y

        this.next_frame = frame_number + 1

        return context.drawImage(
            base_image,
            sourceX, sourceY, sourceWidth, sourceHeight,
            destX, destY, destWidth, destHeight
        )
    }

    return this.init()
}


function GifManager(gifs, config) {
    this.speed = 100

    var context = config.context

    this.base_image = null
    this.objects = prep_gifs(gifs, config)
    this.frames = this.objects.reduce(
        function(prev, el) {
            return el.frames.length > prev ? el.frames.length : prev
        },
        0
    )
    this.gif = null
    this.frame = 0

    this.percent_ready = function() {
        var ready = this.objects.filter(function(el) { return el.ready })
        return ready.length / this.objects.length
    }
    this.ready = function() { return this.percent_ready() === 1 }


    this.clear = function() { context.clearRect(0,0, this.width, this.height ) }
    this.background = function() {

        if( !!! this.base_image ) return false

        var base = this.base_image
        var cropping = base.width < base.height ? 'width' : 'height'

        var new_width = base[cropping] / base.width * base.width
        var new_height = base[cropping] / base.height * base.height

        var offset_width = (base.width - new_width) / 2
        var offset_height = (base.height - new_height) / 2

        context.drawImage(
            base,
            offset_width, offset_height, new_width, new_height,
            0, 0, this.width, this.height
        )
    }
    this.draw = function() {
        this.height = context.canvas.height
        this.width = context.canvas.width

        this.clear()
        this.background()

        for (var i = 0; i < this.objects.length; i++) {
            if( this.objects[i].ready ) this.objects[i].draw()
        };
        if( !! this.gif ) {
            var draw_callback = config.gifs_draw || function() { }
            draw_callback.call(this)
        }
    }
    this.start_drawing = function() {
        var self = this
        this.interval = setInterval( function() { self.draw() }, this.speed)
    }
    this.stop_drawing = function() {
        if( !! this.interval ) clearInterval(this.interval)
        this.clear()
    }
    this.capture = function(progress_meter) {
        var capture_cb = config.gifs_capture || function() { return this }
        capture_cb.call(this)
    }
    this.save_gif = function(url) {
        var save_cb = config.gifs_save || function() { return this }
        save_cb.call(this, url)
    }
    return this

    function rand(number) { return Math.round( Math.random() * number ) }
    function prep_gifs(raw_gifs, config) {
        var context = config.context

        raw_gifs = raw_gifs.sort( function(a,b) {
            if( a.special ) return -1;
            if( b.special ) return -1;
            return Math.random() * 2 - 1
        })

        var range = 10
        var order = [
            {dimension: 'height', coord: 'y' },
            {dimension: 'width', coord: 'x' },
            {dimension: 'height', coord: 'y', offset: context.canvas.height },
            {dimension: 'width', coord: 'x', offset: context.canvas.width }
        ]

        var gifs = []
        var direction = order.shift()
        var dimension = direction.dimension
        var remaining = context.canvas[dimension]


        for( var i=0; i < raw_gifs.length - 1; i++ ) {
            var raw_gif = raw_gifs[i]
            raw_gif.position = {}
            var not_coord = direction.coord === 'x' ? 'y' : 'x'
            var not_dimension = (direction.coord === 'width' ?
                                 'height' : 'width')

            if( remaining >= raw_gif[dimension] ) {
                raw_gif.position[direction.coord] = remaining - raw_gif[dimension]

                if( typeof direction.offset === 'undefined' ) {
                    raw_gif.position[not_coord] = rand(range)
                } else {
                    raw_gif.position[not_coord] = direction.offset
                    raw_gif.position[not_coord] -= rand(range)
                    raw_gif.position[not_coord] -= raw_gif[not_dimension]
                }

                remaining -= raw_gif[dimension];
                gifs.push(raw_gif);
            } else {
                direction = order.shift()
                if( typeof direction !== 'undefined' ) {
                    dimension = direction.dimension
                    remaining = context.canvas[dimension]
                    i -= 1
                } else {
                    break;
                }
            }
        }
        return gifs.map( function(gif) { return new Gif(gif, config) })
    }
}

if( typeof module !== 'undefined' ) {
    module.exports.Gif = Gif
    module.exports.GifManager = GifManager
}
