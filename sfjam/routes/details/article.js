// REST services
var sql = require('../../db/articledb');
var ref = require('../../db/referencedb');
var cat = require('../../db/categorydb');
var opt = require('../../db/dispodb');

// GET

exports.all_articles = function (req, res) {
    sql.findAll(function(arts){
        if(arts){
            cat.findAll(function(cats){
                var l = arts.length;
                var l2 = cats.length;
                for(var i = 0; i < l; i++){
                    for(var j = 0; j < l2; j++){
                        if(arts[i].categorie == cats[j].value){
                            arts[i].categorie = cats[j].nom;
                            break;
                        }
                    }
                }
                res.json({
                    articles: arts
                });
            });
        }else{
            res.json(false);
        }
    });
};

exports.category = function (req, res) {
    var cat_name = req.params.category;
    var details = [];
    var i = 0;
    cat.findByName(cat_name, function(rows){
        if(rows){
            var cat_table = rows[0].value;
            sql.findAllByCategory(cat_table, function(arts){
                if(arts){
                    res.json({
                        articles: arts
                    });
                }
            });
        }else{
            res.json(false);
        }
    });
};

exports.getReference = function (req, res) {
    var cat_name = req.params.category;
    var refer = req.params.ref;

    cat.findByName(cat_name, function(rows){
        if(rows){
            var cat_table = rows[0].value;
            ref.findReference(cat_table, refer, function(art){
                if(art){
                    art[0].category = cat_name;
                    res.json({
                        articles: [art[0]]
                    });
                }
            });
        }else{
            res.json(false);
        }
    });
};

exports.addReference = function (req, res){
    var cat_name = req.params.category;

    var newRef = req.body.ref;
    var nom = req.body.nom;
    var description = req.body.description;
    var taille = req.body.taille;
    var couleur = req.body.couleur;
    var images = req.body.images;
    var prix_ht = req.body.prix_ht;
    var transport = req.body.transport;
    var type = req.body.type;
    var poid = req.body.poid;

    cat.findByName(cat_name, function(rows){
        if(rows){
            var cat_table = rows[0].value;
            ref.insertReference(cat_table, newRef, nom, description, taille, couleur, images, prix_ht, transport, type, poid, function(art){
                if(art){
                    art[0].category = cat_name;
                    res.json(art[0]);
                }else{
                    res.json(false);
                }
            });
        }else{
            res.json(false);
        }
    });
    
};
exports.modReference = function (req, res){
    var cat_name = req.params.category;
    var refer = req.params.ref;

    var nom = req.body.nom;
    var description = req.body.description;
    var type = req.body.type;

    cat.findByName(cat_name, function(rows){
        if(rows){
            var cat_table = rows[0].value;
            ref.updateReference(cat_table, refer, nom, description, type, function(art){
                if(art){
                    art[0].category = cat_name;
                    res.json(art[0]);
                }else{
                    res.json(false);
                }
            });
        }else{
            res.json(false);
        }
    });
};
exports.delReference = function (req, res){
    var cat_name = req.params.category;
    var refer = req.params.ref;

    cat.findByName(cat_name, function(rows){
        if(rows){
            var cat_table = rows[0].value;
            ref.deleteReference(cat_table, refer, function(art){
                if(art){
                    res.json(true);
                }else{
                    res.json(false);
                }
            });
        }else{
            res.json(false);
        }
    });
};

exports.addSizePrice = function (req, res){
    var cat_name = req.params.category;
    var refer = req.params.ref;
    var size = req.body.taille;
    var price = req.body.prix_ht;
    var poid = req.body.poid;
    var transport = req.body.transport;

    cat.findByName(cat_name, function(rows){
        if(rows){
            var cat_table = rows[0].value;

            opt.insertSizePrice(cat_table, refer, size, price, poid, transport, function(art){
                if(art){
                    art[0].category = cat_name;
                    res.json(art[0]);
                }else{
                    res.json(false);
                }
            });
        }else{
            res.json(false);
        }
    });
};
exports.delSizePrice = function (req, res){
    var cat_name = req.params.category;
    var refer = req.params.ref;
    var size = req.params.size;
    var price = req.params.price;

    cat.findByName(cat_name, function(rows){
        if(rows){
            var cat_table = rows[0].value;
            opt.deleteSizePrice(cat_table, refer, size, price, function(art){
                if(art){
                    art[0].category = cat_name;
                    res.json(art[0]);
                }else{
                    res.json(false);
                }
            });
        }else{
            res.json(false);
        }
    });
};

exports.addColorImage = function (req, res){
    var cat_name = req.params.category;
    var refer = req.params.ref;

    var couleur = req.body.couleur;
    var images = req.body.images;

    cat.findByName(cat_name, function(rows){
        if(rows){
            var cat_table = rows[0].value;
            opt.insertColorImg(cat_table, refer, couleur, images, function(art){
                if(art){
                    art[0].category = cat_name;
                    res.json(art[0]);
                }else{
                    res.json(false);
                }
            });
        }else{
            res.json(false);
        }
    });
};
exports.delColorImage = function (req, res){
    var cat_name = req.params.category;
    var refer = req.params.ref;
    var couleur = req.params.color;
    var img = req.params.img;

    cat.findByName(cat_name, function(rows){
        if(rows){
            var cat_table = rows[0].value;
            opt.deleteColorImg(cat_table, refer, couleur, img, function(art){
                if(art){
                    art[0].category = cat_name;
                    res.json(art[0]);
                }else{
                    res.json(false);
                }
            });
        }else{
            res.json(false);
        }
    });
};

exports.isAvailable = function(req, res){
    var cat_name = req.params.category;
    var id = req.params.id;

    updateDispo(cat_name, id, true, res);
};
exports.isNotAvailable = function(req, res){
    var cat_name = req.params.category;
    var id = req.params.id;

    updateDispo(cat_name, id, false, res);
};

var updateDispo = function(name, id, isItAvail, res){
    cat.findByName(name, function(rows){
        if(rows){
            var cat_table = rows[0].value;
            opt.updateDisponibilite(cat_table, id, isItAvail, function(art){
                if(art){
                    art[0].category = name;
                    res.json(art[0]);
                }else{
                    res.json(false);
                }
            });
        }else{
            res.json(false);
        }
    });
};