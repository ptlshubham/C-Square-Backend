const express = require("express");
const router = express.Router();
const db = require("../db/db");
var crypto   = require('crypto');
const jwt = require('jsonwebtoken');



var user;
router.post("/SaveUserRegister", (req, res, next) => {
    console.log("unr here");

    var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
    var repass= salt +''+req.body.password;
    var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
    console.log(encPassword);
        db.executeSql("INSERT INTO `user`(`firstname`,`middlename`,`lastname`,`email`,`password`,`dateofbirth`,`contactnumber`,`isactive`,`createddate`)VALUES('" + req.body.firstname + "','" + req.body.middlename + "','" + req.body.lastname + "','" + req.body.email + "','"+encPassword+"',null," + req.body.contactnumber + "," + req.body.isactive + ",CURRENT_TIMESTAMP);", function (data, err) {
            if (err) {
                console.log("Error in store.js", err);
            }
            else {
                return res.json(data);
            }
        });

});
const auth = () => {
    return (req, res, next) => {
        next()
    }
}

let secret='prnv';
router.post('/authenticate', (req, res,next)=> {
    console.log("hello  im here");
    const body = req.body;
    console.log(body);
    var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
    var repass= salt +''+body.password;
    var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
    console.log(encPassword);
    db.executeSql("select * from user where email='"+req.body.email+"';", function (data, err) {
        console.log(data);
        if (data.length >0) {
            db.executeSql("select * from user where email='"+req.body.email+"' and password='"+encPassword+"';", function (data, err) {
                console.log(data);
                if (data.length >0) {
                    
                    module.exports.user={
                        username: data[0].email ,password:data[0].password
                    }
                      let token = jwt.sign({username: data[0].email ,password:data[0].password},
                        secret,
                        { expiresIn: '1h' // expires in 24 hours
                        }
                        );
                      console.log("token=",token);
                      data[0].token = token;
            
                    res.cookie('auth',token);
                    res.json(data);
                }
                else {
                    return res.json(2);
                }
            });
        }
        else {
            return res.json(1);
        }
    });

});


module.exports = router;