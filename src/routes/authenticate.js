const express = require("express");
const router = express.Router();
const db = require("../db/db");
var crypto = require('crypto');
const jwt = require('jsonwebtoken');



var user;
router.post("/saveTeacherList", (req, res, next) => {
    console.log("unr here");

    var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
    var repass = salt + '' + req.body.password;
    var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
    console.log(encPassword);
    db.executeSql("INSERT INTO `teacherlist`(`firstname`,`lastname`,`qualification`,`contact`,`whatsapp`,`email`,`password`,`address`,`gender`)VALUES('" + req.body.firstname + "','" + req.body.lastname + "','" + req.body.qualification + "','" + req.body.contact + "','" + req.body.Whatsapp + "','" + req.body.email + "','" + encPassword + "','" + req.body.address + "','" + req.body.gender + "');", function (data, err) {
        if (err) {
            console.log(err);

        } else {
            // console.log(res)
            // console.log(err);
            res.json("success");
        }
    });

});

router.post("/SaveStudentList", (req, res, next) => {
    console.log("unr here");

    var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
    var repass = salt + '' + req.body.password;
    var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
    db.executeSql("INSERT INTO `studentlist`(`firstname`,`middlename`,`lastname`,`email`,`password`,`gender`,`dateofbirth`,`contact`,`parents`,`fname`, `mname`, `mnumber`, `pactive`, `mactive`, `cactive`, `batchtime`, `cmmitfee`,`address`,`city`,`pincode`,`standard`,`grnumber`,`transport`,`propic`)VALUES('" + req.body.firstname + "','" + req.body.middlename + "','" + req.body.lastname + "','" + req.body.email + "','" + encPassword + "','" + req.body.gender + "',10-07-2021," + req.body.contact + "," + req.body.parents + ",'" + req.body.fname + "','" + req.body.mname + "'," + req.body.mnumber + "," + req.body.pactive + "," + req.body.mactive + "," + req.body.cactive + ",'" + req.body.batchtime + "','" + req.body.cfees + "','" + req.body.address + "','" + req.body.city + "'," + req.body.pincode + ",'" + req.body.standard + "','" + req.body.grnumber + "'," + req.body.transport + ",'" + req.body.profile + "');", function (data, err) {
        if (err) {
            console.log(err)
        } else {

            res.json("success");
        }
    });

});
const auth = () => {
    return (req, res, next) => {
        next()
    }
}

let secret = 'prnv';
router.post('/UserLogin', (req, res, next) => {
    console.log("hello  im here");
    const body = req.body;
    console.log(body);
    var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
    var repass = salt + '' + body.password;
    var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
    console.log(encPassword);
    if (body.role == 'Teacher') {

        db.executeSql("select * from teacherlist where email='" + req.body.email + "';", function (data, err) {
            console.log(data);
            if (data.length > 0) {
                db.executeSql("select * from teacherlist where email='" + req.body.email + "' and password='" + encPassword + "';", function (data, err) {
                    console.log(data);
                    if (data.length > 0) {

                        module.exports.user = {
                            username: data[0].email, password: data[0].password
                        }
                        let token = jwt.sign({ username: data[0].email, password: data[0].password },
                            secret,
                            {
                                expiresIn: '1h' // expires in 24 hours
                            }
                        );
                        console.log("token=", token);
                        data[0].token = token;

                        res.cookie('auth', token);
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
    }
    else {
        db.executeSql("select * from studentlist where email='" + req.body.email + "';", function (data, err) {
            console.log(data);
            if (data.length > 0) {
                db.executeSql("select * from studentlist where email='" + req.body.email + "' and password='" + encPassword + "';", function (data, err) {
                    console.log(data);
                    if (data.length > 0) {

                        module.exports.user = {
                            username: data[0].email, password: data[0].password
                        }
                        let token = jwt.sign({ username: data[0].email, password: data[0].password },
                            secret,
                            {
                                expiresIn: '1h' // expires in 24 hours
                            }
                        );
                        console.log("token=", token);
                        data[0].token = token;

                        res.cookie('auth', token);
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
    }





});


module.exports = router;