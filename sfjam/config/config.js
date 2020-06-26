var config = {}

config.mysql = {};
config.site = {};
config.mail = {};
config.mercanet = {};

module.exports = config;

/*
PRODUCTION

*/

config.mysql.host = 'localhost';
config.mysql.user = 'norisuser';
config.mysql.password = 'okn124GH';
config.mysql.database = 'noris_sfjam_cat';

config.site.host = 'http://www.noris-sfjam.com';
config.site.port = 80;
config.site.name = 'Production';
config.site.staticdirectory = '/public1';
config.site.maxcacheage = 2592000001; // 30 jours
//config.site.maxcacheage = 0;

config.mail.transUser = 'sfjamnoris.noresponse@gmail.com';
config.mail.transPass = 'contactnoris789';
config.mail.universalSender = 'sfjamnoris.noresponse@gmail.com';
config.mail.norisContact = 'Noris Contact <stephane.noris@free.fr>';
config.mail.norisCommande = 'Noris Commande <easylistening@hotmail.fr>';

config.mercanet.cgi_bin_path = '/var/www/noris.com/cgi-bin/bin/';
config.mercanet.pathfile = '/var/www/noris.com/cgi-bin/pathfile';
config.mercanet.merchant = '031352383900055';

// REMOTE - MULTI CORE
var redis = require("redis"),
    client = redis.createClient();
var uuid = require('node-uuid');

var globalTtl = 900;

client.on("error", function (err) {
    console.log("Error " + err);
});
// REMOTE - MULTI CORE
module.exports.setCachedUser = function(user, admin, callback){
    var key = uuid.v4().toString();
    var log = key.substr(0, key.length / 2);
    var pss = key.substr(log.length);
    user.isAdmin = admin;
    user.login = log;
    user.passw = pss;

    client.set([key, JSON.stringify(user)], function (err, res) {});
    client.expire([key, globalTtl], function (err, res) {});
    callback(user);

};
// REMOTE - MULTI CORE
module.exports.getCachedUser = function(userKey, callback){
    
    client.get(userKey, function(err, reply) {
        // reply is null when the key is missing
        if(reply){
            var u = JSON.parse(reply);
            client.expire([userKey, globalTtl], function (err, res) {});
            callback(u);
        }else{
            callback(false);
        }
    });
}
// REMOTE - MULTI CORE
module.exports.delCachedUser = function(userKey, callback){
    
    client.del(userKey, function(err, res) {
        callback(res > 0);
    });
}

/*
PRE PROD


config.mysql.host = 'localhost';
config.mysql.user = 'norisuser';
config.mysql.password = 'ghj123VBN';
config.mysql.database = 'noris_sfjam_cat';

config.site.host = 'http://37.187.176.15';
config.site.port = 80;
config.site.name = 'Pre production';
config.site.staticdirectory = '/public';
config.site.maxcacheage = 0;

config.mail.transUser = 'sfjamnoris.noresponse@gmail.com';
config.mail.transPass = 'contactnoris789';
config.mail.universalSender = 'sfjamnoris.noresponse@gmail.com';
config.mail.norisContact = 'Noris Contact <mathieufont@orange.fr>';
config.mail.norisCommande = 'Noris Commande <mathieufont@orange.fr>';

config.mercanet.cgi_bin_path = '/root/var/www/noris/cgi-bin/bin/';
config.mercanet.pathfile = '/root/var/www/noris/cgi-bin/pathfile';
config.mercanet.merchant = '082584341411111';


// REMOTE - MULTI CORE
var redis = require("redis"),
    client = redis.createClient();
var uuid = require('node-uuid');

var globalTtl = 900;

client.on("error", function (err) {
    console.log("Error " + err);
});
// REMOTE - MULTI CORE
module.exports.setCachedUser = function(user, admin, callback){
    var key = uuid.v4().toString();
    var log = key.substr(0, key.length / 2);
    var pss = key.substr(log.length);
    user.isAdmin = admin;
    user.login = log;
    user.passw = pss;

    client.set([key, JSON.stringify(user)], function (err, res) {});
    client.expire([key, globalTtl], function (err, res) {});
    callback(user);

};
// REMOTE - MULTI CORE
module.exports.getCachedUser = function(userKey, callback){
    
    client.get(userKey, function(err, reply) {
        // reply is null when the key is missing
        if(reply){
            var u = JSON.parse(reply);
            client.expire([userKey, globalTtl], function (err, res) {});
            callback(u);
        }else{
            callback(false);
        }
    });
}
// REMOTE - MULTI CORE
module.exports.delCachedUser = function(userKey, callback){
    
    client.del(userKey, function(err, res) {
        callback(res > 0);
    });
}

*/

/*
LOCAL


config.mysql.host = 'localhost';
config.mysql.user = 'root';
config.mysql.password = 'superadmin';
config.mysql.database = 'pre_prod';

config.site.host = 'http://37.187.176.15';
config.site.port = 80;
config.site.name = 'local';
config.site.staticdirectory = '/public1';
config.site.maxcacheage = 0;

config.mail.transUser = 'sfjamnoris.noresponse@gmail.com';
config.mail.transPass = 'contactnoris789';
config.mail.universalSender = 'sfjamnoris.noresponse@gmail.com';
config.mail.norisContact = 'Noris Contact <mathieufont@orange.fr>';
config.mail.norisCommande = 'Noris Commande <mathieufont@orange.fr>';

config.mercanet.cgi_bin_path = '/root/var/www/noris/cgi-bin/bin/';
config.mercanet.pathfile = '/root/var/www/noris/cgi-bin/pathfile';
config.mercanet.merchant = '082584341411111';

// LOCAL - MONO CORE
var NodeCache = require( "node-cache" );
var uuid = require('node-uuid');

var globalTtl = 900;

var myCache = new NodeCache();
// LOCAL - MONO CORE
module.exports.setCachedUser = function(user, admin, callback){
    var key = uuid.v4().toString();
    var log = key.substr(0, key.length / 2);
    var pss = key.substr(log.length);
    user.isAdmin = admin;
    user.login = log;
    user.passw = pss;

    myCache.set(key, user, globalTtl);
    callback(user);
};
// LOCAL - MONO CORE
module.exports.getCachedUser = function(userKey, callback){
    
    var cacheUser = myCache.get(userKey);
    if(cacheUser){
        myCache.ttl( userKey, globalTtl );
        callback(cacheUser[userKey]);
    }else{
        callback(false);
    }
};
// LOCAL - MONO CORE
module.exports.delCachedUser = function(userKey, callback){
    callback((myCache.del(userKey) > 0));
};

*/