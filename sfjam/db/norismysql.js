var mysql = require('mysql');
var config = require('../config/config');

var pool  = mysql.createPool({
    host     : config.mysql.host,
    user     : config.mysql.user,
    password : config.mysql.password,
    database : config.mysql.database
});

exports.connectAndQuery = function(querytxt, args, callback){
    pool.getConnection(function(err, conn){
         if(err){
             console.log(err);
             throw err;
         }else{
            conn.query(querytxt, args,  function(err, rows){
                if(err)	{
  	                console.log(err);
                    conn.release();
                    throw err;
                }else{
                    var result = rows;
                    callback(result);
                    conn.release();
                }
            });
         }
     });
};

exports.escVal = function(val){
    return pool.escape(val);
}