// Include the cluster module
var cluster = require('cluster');

// Code to run if we're in the master process
if (cluster.isMaster) {

    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;
    if(cpuCount < 2){
        cpuCount = 2;
    }

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    // Listen for dying workers
    cluster.on('exit', function (worker) {

        // Replace the dead worker, we're not sentimental
        console.log('Worker ' + worker.id + ' died :(');
        cluster.fork();

    });

// Code to run if we're in a worker process
} else {

    var serv = require("./baseServer.js")
    , domain         = require('domain')
    , log            = require('./mailing/norismail').sendLogError
    , config         = require('./config/config');

    serv.start(function(req, res, next) {
            var reqd = domain.create();
            reqd.add(req);
            reqd.add(res);

            reqd.on('error', function(err) {
                try{
                    log(err, req, function(success){
                        res.status(500).end();
                        reqd.dispose();
                        process.exit(1);
                        console.log('sent error ', err.message);
                    });
                    
                }catch(err2){
                    console.log('really really bad', err2);
                    res.status(500).end();
                    reqd.dispose();
                    process.exit(1);
                }
            });

            reqd.run(next);
        }, config.site.port);

}