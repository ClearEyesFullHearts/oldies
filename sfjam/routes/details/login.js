var sign = require('../../db/userdb');
var send = require('../../mailing/norismail');
var uuid = require('node-uuid');

exports.newLog = function (req, res) {
    var logPass = req.body.passw;

    var newUser = {
        "Mail": req.body.mail, 
        "Tel": req.body.tel, 
        "Adresse": req.body.adresse, 
        "Nom": req.body.nom, 
        "Prenom": req.body.prenom, 
        "Pays": req.body.pays, 
        "CP": req.body.cp, 
        "Ville": req.body.ville, 
        "Nom2": req.body.nom2, 
        "Prenom2": req.body.prenom2, 
        "Adresse2": req.body.adresse2, 
        "CP2": req.body.cp2, 
        "Ville2": req.body.ville2, 
        "Pays2": req.body.pays2, 
        "Code": req.body.code
    };
    
    sign.createUser(newUser, logPass, function(success){
        res.json(success);
    });
};

exports.confirmLog = function (req, res){
    var identStr = req.params.id;

    sign.confirmUser(identStr, function(success){
        res.json({
            "success": success
        });
    });
};

exports.modifyUser = function (req, res) {
    var modUser = {
        "ID": req.params.id,
        "Mail": req.body.mail, 
        "Tel": req.body.tel, 
        "Adresse": req.body.adresse, 
        "Nom": req.body.nom, 
        "Prenom": req.body.prenom, 
        "Pays": req.body.pays, 
        "CP": req.body.cp, 
        "Ville": req.body.ville, 
        "Nom2": req.body.nom2, 
        "Prenom2": req.body.prenom2, 
        "Adresse2": req.body.adresse2, 
        "CP2": req.body.cp2, 
        "Ville2": req.body.ville2, 
        "Pays2": req.body.pays2, 
        "Code": req.body.code
    };
    
    sign.modifyUser(modUser, function(user){
        if(user){
            res.json({
                user: user
            });
        }
    });
};

exports.removeUser = function (req, res) {
    var id = req.params.id;
    
    sign.removeUser(id, function(user){
        if(user){
            res.json({
                success: user
            });
        }
    });
};

exports.getAllUsers = function(req, res) {
    sign.getAll(function(users){
        if(users){
            res.json({
                users: users
            });
        }
    });
};

exports.getOneUser = function (req, res) {
    var id = req.params.id;
    var usr = req.user;

    if(usr.isAdmin || (usr.ID == id)){
        sign.getUser(id, function(user){
            if(user){
                res.json({
                    users: [user]
                });
            }else{
                res.json(false);
            }
        });
    }else{
        res.json(false);
    }
    
};

exports.logIn = function (req, res) {
    var logname = req.body.user;
    var logpass = req.body.password;

    sign.signIn(logname, logpass, function(user){
        if(user){
            res.json({
                user: user
            });
        }else{
            res.end();
        }
    });
};

exports.logOut = function (req, res) {
    var logname = req.body.user;
    var logpass = req.body.password;

    sign.signOut(logname, logpass, function(success){
        res.json({
            "success": success
        });
    });
};

exports.resetPassword = function (req, res) {
    var usr = req.body.mail;
    var key = uuid.v4().toString();
    var newPass = key.substr(0, 6);

    send.sendForgottenPassword(newPass, usr, function(success){
        if(success){
            sign.resetPassword(usr, newPass, function(ret){
                res.json(ret);
            });
        }else{
            res.json(false);
        }
    });

    
};

exports.changePassword = function (req, res) {
    var usr = req.user;
    var old = req.body.oldPass;
    var pass = req.body.passw;

    sign.userChangePassword(usr.ID, usr.Mail, pass, old, function(ret){
        if(ret){
            res.json(true);
        }else{
            res.json(false);
        }
    });
};

exports.userExistsInCache = function(req, res){
    var logname = req.body.user;
    var logpass = req.body.password;
    sign.findUser(logname, logpass, function(usr){
        if(usr){
            res.json(true);
        }else{
            res.json(false);
        }
    });
};