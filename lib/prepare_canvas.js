function prep_gifs(raw_gifs, size) {

    var canvas = {}
    canvas.height = typeof size.height !== 'undefined' ? size.height : size
    canvas.width = typeof size.width !== 'undefined' ? size.width : size


    raw_gifs = raw_gifs.sort( function(a,b) {
        if( a.special ) return -1;
        if( b.special ) return 1;
        return Math.random() * 2 - 1
    })


    var order = [
        {dimension: 'height', coord: 'y' },
        {dimension: 'width', coord: 'x' },
        {dimension: 'height', coord: 'y', offset: canvas.height },
        {dimension: 'width', coord: 'x', offset: canvas.width }
    ]

    var gifs = []
    var direction = order.shift()
    var dimension = direction.dimension
    var remaining = canvas[dimension]
    var fudge = 0

    for (var i = 0; i < raw_gifs.length; i++) {
        var raw_gif = raw_gifs[i]
        raw_gif.position = {}
        var not_coord = direction.coord === 'x' ? 'y' : 'x'
        var not_dimension = (direction.coord === 'width' ?
                             'height' : 'width')

        if( remaining - fudge >= raw_gif[dimension] ) {
            var offset = rand(50)
            raw_gif.position[direction.coord] = remaining
            raw_gif.position[direction.coord] -= raw_gif[dimension]
            raw_gif.position[direction.coord] -= offset

            if( typeof direction.offset === 'undefined' ) {
                raw_gif.position[not_coord] = rand(30)
            } else {
                raw_gif.position[not_coord] = direction.offset
                raw_gif.position[not_coord] -= rand(30)
                raw_gif.position[not_coord] -= raw_gif[not_dimension]
            }

            remaining -= raw_gif[dimension]
            remaining -= offset

            gifs.push(raw_gif);
        } else {
            direction = order.shift()
            if( typeof direction !== 'undefined' ) {
                dimension = direction.dimension
                remaining = canvas[dimension]
                remaining -= raw_gifs[i-1][not_dimension]
                if( order.length === 0 ) fudge = raw_gifs[0]['width']
                i -= 1
            } else {
                break;
            }
        }
    }
    return gifs

    function rand(number) { return Math.round( Math.random() * number ) }
}
if( typeof module !== 'undefined' ) {
    module.exports = prep_gifs
}