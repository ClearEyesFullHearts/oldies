var mysql = require('./norismysql');

var all_products = 'select categorie, ref, nom, description, type, pic as images, prix as prix_ht, dispo as disponibilite from products';
var cat_all_article = all_products + ' where categorie = ? ORDER BY ref';
var one_product = all_products + ' where ref = ? and categorie = ?';

exports.findAll = function(callback){
    mysql.connectAndQuery(all_products, [], callback);
};

exports.findAllByCategory = function(categoryName, callback){
    mysql.connectAndQuery(cat_all_article, [categoryName], callback);
};
exports.findOne = function(categoryName, ref, callback){
    mysql.connectAndQuery(one_product, [ref, categoryName], callback);
};