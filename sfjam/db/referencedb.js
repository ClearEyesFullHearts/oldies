var mysql = require('./norismysql');

var num_ref = 'SELECT COUNT(*) as numRef FROM ?? WHERE ref = ?';

var get_base_ref = 'SELECT ID, ref, nom, description, taille, couleur, images, prix_ht, transport, disponibilite, type, poid from ?? where ref = ? ORDER BY taille, couleur';

var new_base_ref = 'INSERT INTO ?? (ref, secret, rab4, nom, type, description, disponibilite, couleur, images, taille, prix_ht, poid, transport)';
new_base_ref += ' VALUES (?, \'\', \'\', ?, ?, ?, \'En Stock\', ?, ?, ?, ?, ?, ?)';

var mod_base_ref = 'UPDATE ?? SET nom = ?, description = ?, type = ? WHERE ref = ?';

var del_base_ref = 'DELETE FROM ?? WHERE ref = ?';

exports.findReference = function(categoryName, ref, callback){
    mysql.connectAndQuery(get_base_ref, [categoryName, ref], function(rows){
        if(rows){
            var r = treatReference(categoryName, rows);
            callback([r]);
        }else{
            callback(false);
        }
    });
};

exports.insertReference = function(categoryName, ref, nom, description, taille, couleur, images, prix_ht, transport, type, poid, callback){
    mysql.connectAndQuery(num_ref, [categoryName, ref], function(rows){

        if(rows && (rows[0].numRef < 1)){
            mysql.connectAndQuery(new_base_ref, [categoryName, ref, nom, type, description, couleur, images, taille, prix_ht, poid, transport], function(res){
                if(res.insertId > 0){
                    var ret = {
                        "ref": ref,
                        "nom": nom,
                        "description": description,
                        "type": type,
                        "category": categoryName,
                        "images": [images],
                        "tailles": [taille],
                        "couleurs": [couleur],
                        "disponibilites": [{
                            "ID": res.insertId,
                            "disponibilite": 'En Stock',
                            "taille": taille,
                            "couleur": couleur,
                            "prix_ht": prix_ht,
                            "poid": poid,
                            "transport": transport
                        }]
                    };

                    callback([ret]);
                }else{
                    callback(false);
                }
            });
        }else{
            callback(false);
        }
    });
};

exports.updateReference = function(categoryName, ref, nom, description, type, callback){
    mysql.connectAndQuery(mod_base_ref, [categoryName, nom, description, type, ref], function(rows){
        if(rows.changedRows > 0){
            mysql.connectAndQuery(get_base_ref, [categoryName, ref], function(rows){
                if(rows){
                    var r = treatReference(categoryName, rows);
                    callback([r]);
                }else{
                    callback(false);
                }
            });
        }else{
            callback(false);
        }
    });
};

exports.deleteReference = function(categoryName, ref, callback){
    mysql.connectAndQuery(del_base_ref, [categoryName, ref], function(rows){
        if(rows.affectedRows > 0){
            callback(true);
        }else{
            callback(false);
        }
    });
};

exports.referenceForTransport = function(cat_name, rows){
    return treatReference(cat_name, rows);
};
var treatReference = function(cat_name, rows){
    var prod = {
        "ref": rows[0].ref,
        "nom": rows[0].nom,
        "description": rows[0].description,
        "type": rows[0].type,
        "category": cat_name,
        "images": [],
        "tailles": [],
        "sizes": [],
        "couleurs": [],
        "colors": [],
        "disponibilites": []
    };

    var clr = '', img = '', tll = '';
    var l = rows.length;
    for(var i = 0; i < l; i++){
        clr = rows[i].couleur.toString().trim();
        img = rows[i].images.toString().trim();
        tll = rows[i].taille.toString().trim();

        if(colorAndImageExists(prod.colors, clr, img)){//((prod.images.indexOf(img) < 0) || (prod.couleurs.indexOf(clr) < 0)){
            prod.colors.push( { couleur: clr, image: img } );
        }
        if(prod.images.indexOf(img) < 0){
            prod.images.push(img);
        }
        if(prod.couleurs.indexOf(clr) < 0){
            prod.couleurs.push(clr);
        }

        if(sizeAndPriceExists(prod.sizes, tll, rows[i].prix_ht)){//(prod.tailles.indexOf(tll) < 0) || (prices.indexOf(rows[i].prix_ht) < 0)){
            prod.sizes.push( { taille: tll, prix_ht: rows[i].prix_ht, transport: rows[i].transport, poid: rows[i].poid } );
        }
        if(prod.tailles.indexOf(tll) < 0){
            prod.tailles.push(tll);
        }

        prod.disponibilites.push({
            "ID": rows[i].ID,
            "disponibilite": rows[i].disponibilite,
            "taille": tll,
            "couleur": clr,
            "prix_ht": rows[i].prix_ht,
            "poid": rows[i].poid,
            "transport": rows[i].transport
        });
    }

    return prod;
};

var sizeAndPriceExists = function(sizesArr, size, price){
    var l = sizesArr.length;
    for(var i = 0; i < l; i++){
        if((sizesArr[i].taille == size) && (sizesArr[i].prix_ht == price)){
            return false;
        }
    }
    return true;
}
var colorAndImageExists = function(colorsArr, color, image){
    var l = colorsArr.length;
    for(var i = 0; i < l; i++){
        if((colorsArr[i].couleur == color) && (colorsArr[i].image == image)){
            return false;
        }
    }
    return true;
}