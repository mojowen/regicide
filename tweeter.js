var redis = require("redis"),
    client = redis.createClient()

// var Twitter = require('node-tweet-stream')
//   , t = new Twitter({
//     consumer_key: 'EGYNtJkjYbESmbUPGBHZCA',
//     consumer_secret: 'TXlCXQfIYu2aLiUgo2GfmAj78DNt6JVQmxjhOM',
//     token: '14759621-lwHJpacKaBNy7ha5tRJccHAVjYoW6EOV54F5uiddw',
//     token_secret: 'xqTzCIGK4DVgW1J9sUQLqPuF5NCMnLGOpMEengNjsQ'
//   })

// t.on('tweet', function (tweet) {
//     // console.log('tweet received', tweet)
//     client.set("foo_rand000000000000", tweet);
// })

// t.on('error', function (err) {
//   console.log('Oh no')
// })

// t.track('nodejs')

client.publish('a nice channel',{data: 1})

    var redis = require("redis"),
        client1 = redis.createClient()


    client1.on("subscribe", function (channel, count) {
    });

    client1.on("message", function (channel, message) {
        console.log("client1 channel " + channel + ": " + message);
    });

    client1.subscribe("a nice channel");
