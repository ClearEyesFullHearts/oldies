var cat = require('../../db/categorydb');

exports.categories = function (req, res) {
    cat.findAll(function(rows){
        res.json({
            categories: rows
        });
    });
};

exports.category = function (req, res) {
    var id = req.params.name;
    cat.findByName(id, function(rows){
        if(rows){
            res.json({
                category: rows[0]
            });
        }else{
            res.json(false);
        }
    });
};