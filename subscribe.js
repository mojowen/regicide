    var redis = require("redis"),
        client1 = redis.createClient()


    client1.on("subscribe", function (channel, count) {
    });

    client1.on("message", function (channel, message) {
        console.log("client1 channel " + channel + ": " + message);
    });

    client1.subscribe("a nice channel");
