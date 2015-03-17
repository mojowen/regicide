var express = require('express')
  , kue = require('kue')
  , url = require('url')
  , redis = require('kue/node_modules/redis');
 
// make sure we use the Heroku Redis To Go URL
// (put REDISTOGO_URL=redis://localhost:6379 in .env for local testing)
 
kue.redis.createClient = function() {
    var redisUrl = url.parse(process.env.REDISTOGO_URL)
      , client = redis.createClient(redisUrl.port, redisUrl.hostname);
    if (redisUrl.auth) {
        client.auth(redisUrl.auth.split(":")[1]);
    }
    return client;
};
 
// then access the current Queue
var jobs = kue.createQueue()
  , app = express.createServer();
 
app.get('/', function(req, res) {
    
    var job = jobs.create('crawl', {
        url: 'http://example.com'
      , token: 'foo'
    });
 
    job.on('complete', function(){
        res.send("Job complete");
    }).on('failed', function(){
        res.send("Job failed");
    }).on('progress', function(progress){
        console.log('job #' + job.id + ' ' + progress + '% complete');
    });
    
    job.save();
});
 
// wire up Kue (see /active for queue interface)
app.use(kue.app);
 
app.listen(process.env.PORT);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);