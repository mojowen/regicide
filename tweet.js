var kue = require('kue')
  , jobs = kue.createQueue();

kue.redis.createClient = function() {
    var redisUrl = url.parse(process.env.REDISTOGO_URL)
    var client = redis.createClient(redisUrl.port, redisUrl.hostname)

    if (redisUrl.auth) {
        client.auth(redisUrl.auth.split(":")[1]);
    }

    return client;
}

var Twitter = require('node-tweet-stream')
  , t = new Twitter({
    consumer_key: process.env.TWITTER,
    consumer_secret: process.env.TWITTER_SECRET,
    token: process.env.TWITTER_OATH,
    token_secret: process.env.TWITTER_OATH_SECRET
  })

t.on('tweet', function (tweet) {
    var job = jobs.create('tweet', tweet).save( function(err){
       if( !err ) console.log( job.id );
    });
})

t.on('error', function (err) {
  console.log('Oh no')
})

t.track('#celebratenvrd')
t.track('#govote')
t.track('#imregistered')
