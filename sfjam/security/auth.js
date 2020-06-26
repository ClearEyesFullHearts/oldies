var identity = require('../db/userdb');

exports.anonymous = function(name, pass, callback){
    if(name == "sfjam" && pass == "noris"){
        callback(null, true);
    }else{
        identity.findUser(name, pass, function(user){
            if(user){
                callback(null, user);
            }else{
                callback(null, false);
            }
        });
    }
};

exports.identified = function(name, pass, callback){
    if(name == "sfjam" && pass == "noris"){
        callback(null, null);
        return;
    }
    identity.findUser(name, pass, function(user){
        if(user){
            callback(null, user);
        }else{
            callback(null, false);
        }
    });
};

exports.admin = function(name, pass, callback){
    identity.isAdmin(name, pass, function(user){
        if(user){
            callback(null, user);
        }else{
            callback(null, false);
        }
    });
};

