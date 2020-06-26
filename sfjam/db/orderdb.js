var mysql = require('./norismysql');

var cleanCaddies = 'DELETE FROM sfj_order WHERE client_ID = ? AND state = 0';

var record = 'INSERT INTO sfj_order (client_ID, order_num, caddie, amount, tax, weight_add, delivery_address, order_date, state)';
record += ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

var updateRecordStatus = 'UPDATE sfj_order SET state = ? WHERE ID = ?';

var getOrders = 'SELECT ID, order_num, caddie, amount, tax, weight_add, delivery_address, order_date, state FROM sfj_order WHERE state > 0 AND client_ID = ? ';
getOrders += 'ORDER BY state DESC, order_date';

var getAllOrders = 'SELECT O.ID, client_ID, Nom, Prenom, order_num, caddie, amount, tax, weight_add, delivery_address, order_date, state FROM sfj_order';
getAllOrders += ' O inner join sfj_clients C on O.client_ID = C.ID';
getAllOrders += '  WHERE state > 0 ORDER BY state DESC, order_date';

var getAdminOrder = 'SELECT O.ID, client_ID, Mail, Tel, Adresse, Nom, Prenom, Pays, CP, Ville, order_num, caddie, amount, tax, weight_add, delivery_address, order_date, state FROM sfj_order';
getAdminOrder += ' O inner join sfj_clients C on O.client_ID = C.ID';
getAdminOrder += '  WHERE order_num = ?';

var getMyOrder = 'SELECT ID, client_ID, order_num, caddie, amount, tax, weight_add, delivery_address, order_date, state FROM sfj_order WHERE order_num = ? ';

exports.recordOrder = function(user, caddie, amount, tva, weight, callback){
    mysql.connectAndQuery(cleanCaddies, [user.ID], function(r){
        var d = new Date();
        //$num_comm = 'Comm'.date("Ymd-His").'-'.$ID_Clients;
        var com = 'Comm' + formatDate(d) + '-' + user.ID;
        var params = [user.ID, com, JSON.stringify(caddie), amount, tva, weight, formatDeliveryAddress(user), d, 0];

        mysql.connectAndQuery(record, params, function(rows){
            if(rows.insertId > 0){
                callback({
                    success: true,
                    order: {
                        ID: rows.insertId,
                        comNum: com,
                        client_ID: user.ID,
                        caddie: caddie,
                        amount: amount,
                        tax: tva,
                        port: weight,
                        delivery: formatDeliveryAddress(user),
                        date: d,
                        state: 0
                    }
                });
            }else{
                callback({ success: false });
            }
        });
    });
};

// order status 0 : To Be Confirmed
// order status 1 : Confirmed & Paid
// order status 2 : In Delivery
// order status 3 : Closed
// order status 4 : Canceled
exports.changeOrderStatus = function(orderID, status, callback){
    if(isNaN(status) || (status < 1) || (status > 4)){
        callback(false);
        return;
    }
    mysql.connectAndQuery(updateRecordStatus, [status, orderID], function(res){
        if(res.changedRows > 0){
            callback(true);
        }else{
            callback(false);
        }
    });
};

exports.findOrders = function(clientID, callback){
    mysql.connectAndQuery(getOrders, [clientID], function(rows){
        var result = { 
            client: clientID,
            orders: []
        };
        if(rows){
            result.orders = rows;
        }
        callback(result);
    });
};

exports.findAllOrders = function(callback){
    mysql.connectAndQuery(getAllOrders, [], function(rows){
        var result = { 
            orders: []
        };

        if(rows){
            result.orders = rows;
        }
        callback(result);
    });
};

exports.findOneOrder = function(commNum, callback){
    mysql.connectAndQuery(getMyOrder, [commNum], callback);
};

exports.findOneOrderAdmin = function(commNum, callback){
    mysql.connectAndQuery(getAdminOrder, [commNum], callback);
};

var formatDeliveryAddress = function(u){
    var retour = u.Nom2 + ' ' + u.Prenom2 + '<br />';
    retour += u.Adresse2 + '<br />';
    retour += u.Ville2 + ' ' + u.CP2 + '<br />';
    retour += u.Pays2 + '<br />';

    return retour;
};

var formatDate = function(d){
    var retour = d.getFullYear().toString();
    retour += digits(d.getMonth() + 1);
    retour += digits(d.getDate());
    retour += '-';
    retour += digits(d.getHours());
    retour += digits(d.getMinutes());
    retour += digits(d.getSeconds());

    return retour;
};

var digits = function(x){
    if(x < 10){
        return '0' + x.toString();
    }else{
        return x.toString();
    }
};