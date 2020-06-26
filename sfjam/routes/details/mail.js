var send = require('../../mailing/norismail');


exports.sendContact = function (req, res) {
    var name = req.body.nom;
    var from = req.body.origin;
    var body = req.body.message;

    send.sendContact(name, from, body, function(success){
        res.json(success);
    });
};