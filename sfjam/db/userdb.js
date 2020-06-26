var mysql = require('./norismysql');
var send = require('../mailing/norismail');
var md5 = require('MD5');
var config = require('../config/config');

var isAdmin = 'SELECT ID FROM admin_log where nom = ? and passe = ?';
var getAllUser = 'SELECT ID , Mail , Tel , Adresse , Nom , Prenom , Pays , CP , Ville , Nom2 , Prenom2 , Adresse2 , CP2 , Ville2 , Pays2 , Code FROM sfj_clients';
var getLog = getAllUser + ' where Mail = ? and Pass = ?';
var getUserByID = getAllUser + ' where ID = ?';

var createUser = 'INSERT INTO sfj_clients ';
createUser += '(Mail , Pass , Tel , Adresse , Nom , Prenom , Pays , CP , Ville , Nom2 , Prenom2 , Adresse2 , CP2 , Ville2 , Pays2 , Code) ';
createUser += 'VALUES ';
createUser += '(? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ?)';


var isUserMailExists = 'SELECT COUNT(*) as nb FROM sfj_clients WHERE Mail = ?';

var updateUser = 'UPDATE sfj_clients SET ';
updateUser += 'Mail = ? , Tel = ? , Adresse = ? , Nom = ? , Prenom = ? , Pays = ? , CP = ? , Ville = ? , Nom2 = ? , Prenom2 = ? , Adresse2 = ? , CP2 = ? , Ville2 = ? , Pays2 = ? , Code = ? ';
updateUser += 'WHERE ID = ?';

var getTempUser = 'SELECT ID , Nom , Prenom FROM sfj_clients ';
getTempUser += 'WHERE Code <> ? ORDER BY ID DESC';
var confirmUser = 'UPDATE sfj_clients SET Code = ? ';
confirmUser += 'WHERE ID = ?';

var deleteUser = 'DELETE FROM sfj_clients WHERE ID = ?';

var updatePassword = 'UPDATE sfj_clients SET Pass = ? WHERE ID = ?';
var resetPassword = 'UPDATE sfj_clients SET Pass = ? WHERE Mail = ?';

exports.signIn = function(name, pass, callback){
    console.log('userdb exports.signIn');
    var user = null;
    var mdPass = md5(pass).toString();
    mysql.connectAndQuery(getLog, [name, mdPass], function(arr){
        if(arr.length > 0){
            if(arr[0].Code == 'ok'){
                user = config.setCachedUser(arr[0], false, callback);
            }else{
                callback(false);
            }
        }else{
            mysql.connectAndQuery(isAdmin, [name, mdPass], function(arr){
                if(arr.length > 0){
                    if(arr[0].ID > 0){
                        user = {
                            "ID": arr[0].ID
                        }
                        user = config.setCachedUser(user, true, callback);
                    }else{
                        callback(false);
                    }
                }else{
                    callback(false);
                }
            });
        }
    });
};

exports.signOut = function(name, pass, callback){
    var usrKey = name + pass
    config.delCachedUser(usrKey, callback);
};

exports.isAdmin = function(name, pass, callback){
    var usrKey = name + pass;
    config.getCachedUser(usrKey, function(value){
        if(value && (value.isAdmin)){
            callback(value);
        }else{
            callback(null);
        }
    });
};

exports.getAll = function(callback){
    var users = [];
    mysql.connectAndQuery(getAllUser, [], function(arr){
        if(arr){
            users = arr;
        }
        callback(users);
    });
};

exports.getUser = function(id, callback){
    var user = [];
    mysql.connectAndQuery(getUserByID, [id], function(arr){
        if(arr){
            user = [arr[0]];
        }
        callback(user);
    });
};

exports.findUser = function(name, pass, callback){
    var usrKey = name + pass;
    config.getCachedUser(usrKey, callback);
};

exports.createUser = function(newUser, password, callback){
    mysql.connectAndQuery(isUserMailExists, [newUser.Mail], function(exists){
        if(exists[0].nb == 0){
            var values = [newUser.Mail, 
                md5(password).toString(),
                newUser.Tel, 
                newUser.Adresse, 
                newUser.Nom, 
                newUser.Prenom, 
                newUser.Pays, 
                newUser.CP, 
                newUser.Ville, 
                newUser.Nom2, 
                newUser.Prenom2, 
                newUser.Adresse2, 
                newUser.CP2, 
                newUser.Ville2, 
                newUser.Pays2, 
                newUser.Code];
            
            mysql.connectAndQuery(createUser, values, function(arr){
                if(arr.insertId > 0){
                    newUser.ID = arr.insertId;
                    var str = newUser.ID.toString() + newUser.Nom.toString() + newUser.Prenom.toString();
                    var ident = md5(str).toString();

                    //send confirm mail
                    send.sendConfirmUserMail(ident, newUser.Mail, function(res){
                        if(res){
                            callback(true);
                        }else{
                            callback(false);
                        }
                    });
                }else{
                    callback(false);
                }
            });
        }else{
            callback(false);
        }
    });
    
};

exports.confirmUser = function(identification, callback){
    mysql.connectAndQuery(getTempUser, ['ok'], function(arr){
        if(arr){
            var l = arr.length;
            var str = '';
            for(var i=0; i < l; i++){
                str = arr[i].ID.toString() + arr[i].Nom + arr[i].Prenom;
                if(identification == md5(str).toString()){
                    mysql.connectAndQuery(confirmUser, ['ok', arr[i].ID], function(res){
                        if(res.changedRows > 0){
                            callback(true);
                        }else{
                            callback(false);
                        }
                    });
                    return;
                }
            }
        }
        callback(false);
    });

    
};

exports.modifyUser = function(modUser, callback){
    console.log('userdb modifyUser ::', modUser);
    var values = [modUser.Mail,
        modUser.Tel, 
        modUser.Adresse, 
        modUser.Nom, 
        modUser.Prenom, 
        modUser.Pays, 
        modUser.CP, 
        modUser.Ville, 
        modUser.Nom2, 
        modUser.Prenom2, 
        modUser.Adresse2, 
        modUser.CP2, 
        modUser.Ville2, 
        modUser.Pays2, 
        modUser.Code,
        modUser.ID];
    
    mysql.connectAndQuery(updateUser, values, function(arr){
        if(arr.changedRows > 0){
            modUser = config.setCachedUser(modUser, false, callback);
        }else{
            callback(false);
        }
    });
};

exports.removeUser = function(id, callback){
    mysql.connectAndQuery(deleteUser, [id], function(arr){
        if(arr.affectedRows > 0){
            callback(true);
        }else{
            callback(false);
        }
    });
};

exports.userChangePassword = function(id, mail, newPass, oldPass, callback){
    var mdPass = md5(oldPass).toString();
    console.log('userdb userChangePassword :', oldPass);
    mysql.connectAndQuery(getLog, [mail, mdPass], function(arr){
        
        console.log('userdb userChangePassword getLog:', arr);
        if(arr.length > 0){
            
            console.log('userdb userChangePassword getLog: ' + id  + ' = ' + arr[0].ID);
            if(id == arr[0].ID){
                mysql.connectAndQuery(updatePassword, [md5(newPass).toString(), arr[0].ID], function(arr){
                    if(arr.affectedRows > 0){
                        callback({
                            success: true,
                            password: newPass
                           });
                    }else{
                        callback(false);
                    }
                });
            }else{
                callback(false);
            }
        }else{
            callback(false);
        }
    });
};
exports.resetPassword = function(mail, newPass, callback){
    
    mysql.connectAndQuery(resetPassword, [md5(newPass).toString(), mail], function(arr){
        if(arr.affectedRows > 0){
            callback(true);
        }else{
            callback(false);
        }
    });
};