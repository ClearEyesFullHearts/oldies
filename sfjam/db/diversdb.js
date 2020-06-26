var mysql = require('./norismysql');

var countries = 'SELECT Pays, Cout FROM sfj_pays ORDER BY Pays';
var multi = 'SELECT Cout FROM sfj_pays WHERE Pays = ?';
var weights = 'SELECT poids, prix FROM sfj_poids';

exports.findCountries = function(callback){
    mysql.connectAndQuery(countries, [], callback);
};
exports.findCountryMultiplier = function(country, callback){
    mysql.connectAndQuery(multi, [country], function (result){
        if(result){
            callback(result[0].Cout);
        }else{
            callback('2');
        }
    });
};

exports.findWeights = function(callback){
    mysql.connectAndQuery(weights, [], callback);
};
