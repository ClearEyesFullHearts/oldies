var ord = require('../../db/orderdb');
var merc = require('../../mercanet/call');
var config = require('../../config/config');
var mail = require('../../mailing/norismail').sendLogMessage;

exports.createClientOrder = function(req, res){
    var usr = req.user;
    var caddie = req.body.caddie;
    var total = req.body.totalAmount;
    var taxes = req.body.tva;
    var weight = req.body.poid;

    ord.recordOrder(usr, caddie, total, taxes, weight, function(result){
        var tt = total * 100;
        if(result.success){
            var params = {
                cgi_bin_path: config.mercanet.cgi_bin_path,
                pathfile: config.mercanet.pathfile,
                merchant_id: config.mercanet.merchant,
                amount: tt,
                customer_id: usr.ID,
                customer_email: usr.Mail,
                language: 'fr',
                caddie: JSON.stringify({ ID : result.order.ID, client_ID : result.order.client_ID, numm : result.order.comNum })
            };

            merc.callRequest(params, function(data){
                if(data){
                    result.payRequest = data;
                    if(!data.success){
                        var msg = 'payRequest a échoué avec le message suivant : ' + data.msg + ', dans routes/details/order.js ligne 31.\n';
                        msg += 'user : ' + usr.Mail + '\n';
                        msg += 'total : ' + tt + '\n';
                        msg += 'taxes : ' + taxes + '\n';
                        msg += 'weight : ' + weight + '\n';
                        msg += 'caddie : ' + JSON.stringify(result.order) + '\n';
                        mail(msg, function(res){});
                    }
                    res.json(result);
                }else{
                    mail('mercanet/call callRequest n\'a pas fonctionné dans routes/details/order.js ligne 35.', function(res){});
                    res.json(false);
                }
            });
        }else{
            res.json(false);
            mail('orderdb recordOrder n\'a pas fonctionné dans routes/details/order.js ligne 41.', function(res){});
        }
    });
};

exports.orderInPreparation = function(req, res){
    var orderID = req.params.id;
    ord.changeOrderStatus(orderID, 1, function(result){
        res.json(result);
    });
};
exports.orderInDelivery = function(req, res){
    var orderID = req.params.id;
    ord.changeOrderStatus(orderID, 2, function(result){
        res.json(result);
    });
};
exports.orderClosed = function(req, res){
    var orderID = req.params.id;
    ord.changeOrderStatus(orderID, 3, function(result){
        res.json(result);
    });
};
exports.orderCanceled = function(req, res){
    var orderID = req.params.id;
    ord.changeOrderStatus(orderID, 4, function(result){
        res.json(result);
    });
};

exports.findClientOrders = function(req, res){
    var usr = req.user;
    ord.findOrders(usr.ID, function(results){
        if(results.orders.length > 0){
            var l = results.orders.length;
            for(var i = 0; i < l; i++){
                results.orders[i].caddie = JSON.parse(results.orders[i].caddie);
            }
            res.json({
                orders: results.orders
            });
        }else{
            res.json(false);
        }
    });
};

exports.findAdminOrders = function(req, res){
    ord.findAllOrders(function(results){
        if(results.orders.length > 0){
            var l = results.orders.length;
            for(var i = 0; i < l; i++){
                results.orders[i].caddie = JSON.parse(results.orders[i].caddie);
            }
            res.json({
                orders: results.orders
            });
        }else{
            res.json(false);
        }
    });
};

exports.findAdminClientOrders = function(req, res){
    var usr = req.params.client_id;
    ord.findOrders(usr, function(results){
        if(results.orders.length > 0){
            var l = results.orders.length;
            for(var i = 0; i < l; i++){
                results.orders[i].caddie = JSON.parse(results.orders[i].caddie);
            }
            res.json({
                orders: results.orders
            });
        }else{
            res.json(false);
        }
    });
};

exports.findOrder = function(req, res){
    var usr = req.user;
    var num = req.params.numComm;
    if(usr.isAdmin){
        ord.findOneOrderAdmin(num, function(results){
            if(results){
                results[0].caddie = JSON.parse(results[0].caddie);
                res.json({
                    order: results[0]
                });
            }else{
                res.json(false);
            }
        });
    }else{
        ord.findOneOrder(num, function(results){
            if(results){
                if(results[0].client_ID == usr.ID){
                    results[0].caddie = JSON.parse(results[0].caddie);
                    res.json({
                        order: results[0]
                    });
                }else{
                    res.json(false);
                }
            }else{
                res.json(false);
            }
        });
    }
};