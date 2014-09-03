function Gif (config, context) {
    this.ready = false
    this.frames = config.frames

    this.height = config.height
    this.width = config.width

    this.position = {
        x: Math.round( Math.random() * (context.canvas.width - this.width)),
        y: Math.round( Math.random() * (context.canvas.height - this.height))
    }
    this.next_frame = 0

    this.init = function() {
        var img = document.createElement('img')
        var self = this

        img.src = config.sprite_path
        img.style.width = '0px'
        img.style.height = '0px'

        img.onload = function() { self.ready = true; }
        document.body.appendChild(img)

        return self
    }
    this.draw = function(frame) {
        var frame_number = (frame || this.next_frame) % this.frames.length
        var frame = this.frames[ frame_number ]

        var height = this.height
        var width = frame.width

        var base_image = new Image()
        base_image.src = config.sprite_path

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


function GifManager(gifs, context) {
    var height = context.canvas.height
    var width = context.canvas.width
    var speed = 100

    this.objects = gifs.map( function(gif) { return new Gif(gif, context) })

    this.percent_ready = function() {
        var ready = this.objects.filter(function(el) { return el.ready })
        return ready.length / this.objects.length
    }
    this.ready = function() { return this.percent_ready() === 1 }


    this.clear = function() { context.clearRect(0,0, width, height ) }
    this.draw = function() {
        this.clear()
        for (var i = this.objects.length - 1; i >= 0; i--) {
            if( this.objects[i].ready ) this.objects[i].draw()
        };
    }
    this.start_drawing = function() {
        this.interval = setInterval( function() { Gifs.draw() }, 100)
    }
    this.stop_drawing = function() {
        if( !! this.interval ) clearInterval(this.interval)
        this.clear()
    }

    return this
}


var Gifs = null
var canvas = document.getElementById('viewport')
var context = canvas.getContext('2d')

function load_gifs(gifs) {
    Gifs = new GifManager(gifs, context)
    Gifs.start_drawing()
}
