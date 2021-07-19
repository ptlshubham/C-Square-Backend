
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "awsecommercenew.cyuzel9ebm9t.us-east-2.rds.amazonaws.com",
    user: "masteradmin",
    password: "ecommerce123",
    database:"awsecommerce"
  });
  exports.executeSql = function ( sql, callback){
        con.query(sql, function (err, result) {
            if (err) {
               // throw err;
                callback(null , err);
            }
            else{
                callback(result); 
            }
           
        });
       
  }
