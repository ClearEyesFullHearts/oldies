var div = require('../../db/diversdb');


exports.pays = function (req, res){
    div.findCountries(function(rows){
        res.json({
            pays: rows
        });
    });
};

exports.fraisPortPays = function (req, res){
    var p = req.params.country;
    div.findCountryMultiplier(p, function(num){
        res.json({
            multi: num
        });
    });
};

exports.poids = function (req, res){
    div.findWeights(function(rows){
        res.json({
            poids: rows
        });
    });
};