var mysql = require('./norismysql');
var artdb = require('./articledb');
var refdb = require('./referencedb');

var modDispo = 'UPDATE ?? SET disponibilite = ? WHERE id = ?';

var deleteColor = 'DELETE FROM ?? WHERE ref = ? AND couleur = ? AND images = ?;';
var deleteSize = 'DELETE FROM ?? WHERE ref = ? AND taille = ? AND prix_ht like ?;';

var availableSizes = 'SELECT ref, taille, prix_ht, poid, transport FROM ?? GROUP BY ref, taille, prix_ht, poid, transport HAVING ref = ?';
var availableColors = 'SELECT ref, couleur, images FROM ?? GROUP BY ref, couleur, images HAVING ref = ?';

var colorExists = 'SELECT count(*) as nb FROM ?? WHERE ref = ? AND couleur = ? AND images = ?;';
var sizeExists = 'SELECT count(*) as nb FROM ?? WHERE ref = ? AND taille = ? AND prix_ht like ?;';

exports.insertColorImg = function(categoryName, ref, couleur, image, callback){
    if((couleur && image) && (couleur != '') && (image != '')){
        console.log('insertColorImg ', couleur, image);
        mysql.connectAndQuery(colorExists, [categoryName, ref, couleur, image], function(count){
            if(count[0].nb < 1){
                artdb.findOne(categoryName, ref, function(baseRef){
                    if(baseRef){
                        var baseNom = mysql.escVal(baseRef[0].nom);
                        var baseType = mysql.escVal(baseRef[0].type);
                        var baseDesc = mysql.escVal(baseRef[0].description);
                        var baseDispo = mysql.escVal(baseRef[0].disponibilite);

                        mysql.connectAndQuery(availableSizes, [categoryName, ref], function(sizes){
                            if(sizes.length > 0){
                                var sql = 'INSERT INTO ' + categoryName + ' (ref, secret, rab4, nom, type, description, disponibilite, couleur, images, taille, prix_ht, poid, transport) ';
                                sql += 'VALUES ';

                                var l = sizes.length;
                                var fixSQL =  '(' + mysql.escVal(ref) + ', \'\', \'\', ' + baseNom + ', ' + baseType + ', ' + baseDesc + ', ' + baseDispo + ', ' + mysql.escVal(couleur) + ', ' + mysql.escVal(image);
                                for(var i = 0; i < l; i++){
                                    sql += fixSQL + ', ' + mysql.escVal(sizes[i].taille) + ', ' + mysql.escVal(sizes[i].prix_ht) + ', ' + mysql.escVal(sizes[i].poid) + ', ' + mysql.escVal(sizes[i].transport) + ')';
                                    if(i < (l-1)){
                                        sql += ', ';
                                    }
                                }
                                sql += ';';
                                mysql.connectAndQuery(sql, [], function(res){
                                    if(res.affectedRows > 0){
                                        refdb.findReference(categoryName, ref, callback);
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
            }else{
                callback(false);
            }
        });
    }else{
        callback(false);
        return;
    }
};
exports.deleteColorImg = function(categoryName, ref, couleur, image, callback){
    checkMoreThanOneColor(categoryName, ref, function(possible){
        if(possible){
            mysql.connectAndQuery(deleteColor, [categoryName, ref, couleur, image], function(rows){
                if(rows.affectedRows > 0){
                    refdb.findReference(categoryName, ref, callback);
                }else{
                    callback(false);
                }
            });
        }else{
            callback(false);
        }
    });
    
};

exports.insertSizePrice = function(categoryName, ref, taille, prix, poid, transport, callback){
    if((taille && prix) && (taille != '') && (prix != '')){
        mysql.connectAndQuery(sizeExists, [categoryName, ref, taille, prix], function(count){
            if(count[0].nb < 1){
                artdb.findOne(categoryName, ref, function(baseRef){
                    if(baseRef){
                        var baseNom = mysql.escVal(baseRef[0].nom);
                        var baseType = mysql.escVal(baseRef[0].type);
                        var baseDesc = mysql.escVal(baseRef[0].description);
                        var baseDispo = mysql.escVal(baseRef[0].disponibilite);

                        mysql.connectAndQuery(availableColors, [categoryName, ref], function(sizes){
                            if(sizes.length > 0){
                                var sql = 'INSERT INTO ' + categoryName + ' (ref, secret, rab4, nom, type, description, disponibilite, taille, prix_ht, poid, transport, couleur, images) ';
                                sql += 'VALUES ';

                                var l = sizes.length;
                                var fixSQL =  '(' + mysql.escVal(ref) + ', \'\', \'\', ' + baseNom + ', ' + baseType + ', ' + baseDesc + ', ' + baseDispo + ', ';
                                fixSQL += mysql.escVal(taille) + ', ' + mysql.escVal(prix) + ', ' + mysql.escVal(poid) + ', ' + mysql.escVal(transport);
                    
                                for(var i = 0; i < l; i++){
                                    sql += fixSQL + ', ' + mysql.escVal(sizes[i].couleur) + ', ' + mysql.escVal(sizes[i].images) + ')\n';
                                    if(i < (l-1)){
                                        sql += ', ';
                                    }
                                }
                                sql += ';';

                                mysql.connectAndQuery(sql, [], function(res){
                                    if(res.affectedRows > 0){
                                        refdb.findReference(categoryName, ref, callback);
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
            }else{
                callback(false);
            }
        });
    }else{
        callback(false);
        return;
    }
};
exports.deleteSizePrice = function(categoryName, ref, taille, prix, callback){
    checkMoreThanOneSize(categoryName, ref, function(possible){
        if(possible){
            mysql.connectAndQuery(deleteSize, [categoryName, ref, taille, prix], function(rows){
                if(rows.affectedRows > 0){
                    refdb.findReference(categoryName, ref, callback);
                }else{
                    callback(false);
                }
            });
        }else{
            callback(false);
        }
    });
    
};

exports.updateDisponibilite = function(categoryName, id, dispo, callback){
    var strDispo = 'RUPTURE DE STOCK';
    if(dispo){
        strDispo = 'En Stock';
    }

    mysql.connectAndQuery(modDispo, [categoryName, strDispo, id], function(rows){
        if(rows.changedRows > 0){
            var sql = 'SELECT ID, ref, nom, description, taille, couleur, images, prix_ht, transport, disponibilite, type, poid ';
            sql += 'FROM ' + categoryName + ' WHERE ref = (SELECT ref FROM ' + categoryName + ' WHERE ID = ' + mysql.escVal(id) + ')';
            mysql.connectAndQuery(sql, [], function(ref){
                var r = refdb.referenceForTransport(categoryName, ref);
                callback([r]);
            });
        }else{
            callback(false);
        }
    });
};

var checkMoreThanOneSize = function(cat, ref, callback){
    mysql.connectAndQuery(availableSizes, [cat, ref], function(sizes){
        callback((sizes.length > 1));
    });
};
var checkMoreThanOneColor = function(cat, ref, callback){
    mysql.connectAndQuery(availableColors, [cat, ref], function(colors){
        callback((colors.length > 1));
    });
};