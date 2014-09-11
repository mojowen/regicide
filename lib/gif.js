function Gif (config, context) {
    this.ready = false
    this.frames = config.frames

    this.height = config.height
    this.width = config.width

    this.next_frame = 0

    this.set_position = function() {
        this.position = {
            x: Math.round( Math.random() * (context.canvas.width - this.width)),
            y: Math.round( Math.random() * (context.canvas.height - this.height))
        }
    }
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
    var speed = 100

    this.base_image = null
    this.objects = gifs.map( function(gif) { return new Gif(gif, context) })
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

        for (var i = this.objects.length - 1; i >= 0; i--) {
            if( this.objects[i].ready ) this.objects[i].draw()
        };
        if( !! this.gif ) {
            if( this.frame < this.frames ) {
                this.gif.addFrame(context.canvas, {delay: speed});
                this.frame += 1
            } else {
                this.frame = 0
                var gif = this.gif
                this.gif = null
                gif.render()
            }
        }
    }
    this.start_drawing = function() {
        for (var i = this.objects.length - 1; i >= 0; i--) {
            this.objects[i].set_position()
        }
        this.interval = setInterval( function() { Gifs.draw() }, speed)
    }
    this.stop_drawing = function() {
        if( !! this.interval ) clearInterval(this.interval)
        this.clear()
    }
    this.capture = function(progress_meter) {
        this.gif = new GIF({
            workers: 1,
            quality: 2
        });
        this.gif.setOptions({
            workerScript: './lib/gif_maker.worker.js'
        })

        this.frame = 0
        var self = this

        this.gif.on('finished', function(blob) {
            self.save_gif(URL.createObjectURL(blob))
        })
        this.gif.on('progress', function(progress) {
            // should be a callback
        })
    }
    this.save_gif = function(url) {
        // should be a callback
        main.className = 'uploaded done'
        viewport.style.display = 'none'
        download_links = main.querySelectorAll('.download-url')
        for (var i = download_links.length - 1; i >= 0; i--) {
            download_links[i].setAttribute('href',url)
        };
        the_gif.src = url
    }
    return this
}


function load_gifs(gifs) {
    var Gifs = null
    var canvas = document.getElementById('viewport')
    var context = canvas.getContext('2d')

    Gifs = new GifManager(gifs, context)
    window.Gifs = Gifs
}
