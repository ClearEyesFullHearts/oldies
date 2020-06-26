var merc = require('../../mercanet/call');
var ord = require('../../db/orderdb');
var usr = require('../../db/userdb');
var mail = require('../../mailing/norismail');
var config = require('../../config/config');

var url = config.site.host;

exports.canceled = function (req, res){
    var params = {
        cgi_bin_path: config.mercanet.cgi_bin_path,
        pathfile: config.mercanet.pathfile,
        data: req.body.DATA
    };
    merc.callResponse(params, function(data){

        ord.changeOrderStatus(data.msg.caddie.ID, 4, function(result){
            data.msg.caddie.state = 4;
            res.redirect(url + '/#/Profil');
        });
    });
    
};

exports.response = function (req, res){
    var params = {
        cgi_bin_path: config.mercanet.cgi_bin_path,
        pathfile: config.mercanet.pathfile,
        data: req.body.DATA
    };
    merc.callResponse(params, function(data){
        if(data){
            var cart = JSON.parse(data.msg.caddie);
            ord.findOneOrder(cart.numm, function(myOrder){
                if(myOrder.length > 0){
                    if(myOrder[0].state == 0){
                        var status = 4;
                        if(data.msg.bank_response_code == '00'){
                            status = 1;
                        }
                        
                        ord.changeOrderStatus(cart.ID, status, function(result){
                            cart.state = status;
                            if(status == 1){
                                mail.sendConfirmClient(req.user, myOrder[0].caddie, function(suc){});
                                mail.sendConfirmNoris(req.user, myOrder[0].caddie, function(suc){});
                            }
                            //res.write(data.msg.error);
                            //res.end();
                            res.redirect(url + '/#/Profil');
                        });
                    }else{
                        //res.write(data.msg.error);
                        //res.end();
                        res.redirect(url + '/#/Profil');
                    }
                }else{
                    //res.write(data.msg.error);
                    //res.end();
                    res.redirect(url + '/#/Profil');
                }
            
            });
        }else{
            //res.write(data.msg.error);
            //res.end();
            res.redirect(url + '/#/Profil');
        }
    });
};

exports.auto = function (req, res){
    var params = {
        cgi_bin_path: config.mercanet.cgi_bin_path,
        pathfile: config.mercanet.pathfile,
        data: req.body.DATA
    };
    merc.callResponse(params, function(data){
        if(data){
            var status = 4;
            if(data.msg.bank_response_code == '00'){
                status = 1
            }
            var cart = JSON.parse(data.msg.caddie);

            ord.changeOrderStatus(cart.ID, status, function(result){

                ord.findOneOrder(cart.numm, function(comm){
                    
                    var facture = {
                        ID: comm[0].ID,
                        comNum: comm[0].order_num,
                        client_ID: comm[0].client_ID,
                        caddie: JSON.parse(comm[0].caddie),
                        amount: comm[0].amount,
                        tax: comm[0].tax,
                        port: comm[0].weight_add,
                        delivery: comm[0].delivery_address,
                        date: comm[0].order_date,
                        state: comm[0].state
                    }

                    usr.getUser(cart.client_ID, function(ret){
                        
                        if((ret.length > 0) && (status == 1)){
                            mail.sendConfirmClient(ret[0], facture, function(suc){});
                            mail.sendConfirmNoris(ret[0], facture, function(suc){});
                        }

                    });
                    res.end();
                });
                
            });
        }else{
            res.end();
        }
    });

};