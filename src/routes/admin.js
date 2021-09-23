const express = require("express");
const router = express.Router();
const db = require("../db/db");
const multer = require('multer');
const path = require('path');
const config = require("../../config");
var midway = require('./midway');
const jwt = require('jsonwebtoken');
var crypto = require('crypto');
const { equal } = require("assert");
const { Console } = require("console");
const { json } = require("body-parser");
const nodemailer = require('nodemailer');



router.post("/SaveStdList", midway.checkToken, (req, res, next) => {
    console.log(req.body);
    db.executeSql("INSERT INTO `stdlist`(`stdname`, `isactive`, `createddate`, `updateddare`)VALUES('" + req.body.stdname + "'," + req.body.isactive + ",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);", function (data, err) {
        if (err) {
            res.json("error");
        } else {

            res.json("success");
        }
    });
});

router.post("/GetStdList", midway.checkToken, (req, res, next) => {
    // console.log(req.body);
    if (req.body.role == 'Admin') {
        db.executeSql("select * from stdlist", function (data, err) {
            if (err) {
                console.log(err);
            } else {
                return res.json(data);
            }
        })
    }
    else {
        db.executeSql("select distinct(stdid) from subrightstoteacher where teacherid=" + req.body.teachid, function (data, err) {
            if (err) {
                console.log("Error in store.js", err);
            } else {
                // console.log(data);
                let std = [];
                for (let i = 0; i < data.length; i++) {
                    db.executeSql("select * from stdlist where id=" + data[i].stdid, function (data1, err) {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            // console.log(data1);
                            std.push(data1[0]);
                            if (std.length == data.length) {
                                res.json(std);
                            }
                        }
                    })
                }
                // console.log(std);


            }
        });
    }

});

router.get("/RemoveStandardList/:id", midway.checkToken, (req, res, next) => {

    console.log(req.params.id);
    db.executeSql("Delete from stdlist where id=" + req.params.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.post("/saveSubject", midway.checkToken, (req, res, next) => {
    // console.log(req.body);
    for (let i = 0; i < req.body.length; i++) {
        db.executeSql("INSERT INTO `csquare`.`subjectlist`(`stdid`,`subject`,`isactive`)VALUES(" + req.body[i].id + ",'" + req.body[i].subject + "',true);", function (data, err) {
            if (err) {
                console.log(err);

            } else {

            }
        });
    }
    res.json("success");
});

router.post("/GetSubjectList", midway.checkToken, (req, res, next) => {
    // console.log(req.body);
    if (req.body.role == 'Admin') {
        db.executeSql("select * from subjectlist where stdid=" + req.body.id, function (data, err) {
            if (err) {
                console.log("Error in store.js", err);
            } else {

                return res.json(data);
            }

        });
    }
    else {
        db.executeSql("select * from subrightstoteacher where teacherid=" + req.body.teachid + " and stdid=" + req.body.id, function (data, err) {
            let sub = [];

            if (err) {
                console.log(err)
            }
            else {
                console.log(data);
                for (let i = 0; i < data.length; i++) {
                    db.executeSql("select * from subjectlist where id=" + data[i].subid, function (data1, err) {
                        if (err) {
                            console.log("Error in store.js", err);
                        } else {
                            sub.push(data1[0]);
                            if (sub.length == data.length) {
                                return res.json(sub);
                            }
                        }
                    });
                }
            }

        })
    }






});


router.post("/UpdateSujectList", midway.checkToken, (req, res, next) => {
    console.log(req.body)
    db.executeSql("UPDATE `csquare`.`subjectlist` SET subject='" + req.body.subject + "' WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});


router.get("/RemoveSubjectList/:id", midway.checkToken, (req, res, next) => {

    console.log(req.params.id);
    db.executeSql("Delete from subjectlist where id=" + req.params.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.post("/GetStdItem", midway.checkToken, (req, res, next) => {
    db.executeSql("select * from stdlist where id=" + req.body.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.get("/GetQueType", midway.checkToken, (req, res, next) => {
    db.executeSql("select * from quetype ", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/saveQueList", midway.checkToken, (req, res, next) => {
    db.executeSql("INSERT INTO `questionlist`(`stdid`,`subid`,`question`,`imageque`,`marks`,`time`,`quetype`,`isactive`)VALUES(" + req.body.stdid + "," + req.body.subid + ",'" + req.body.question + "','" + req.body.imageque + "'," + req.body.marks + "," + req.body.time + ",'" + req.body.quetype + "',false);", function (data, err) {
        // console.log(req.err)
        if (err) {
            console.log(err);
        } else {
            if (req.body.quetype == 'MCQ') {
                console.log(data.insertId);
                for (let i = 0; i < req.body.options.length; i++) {
                    db.executeSql("INSERT INTO `csquare`.`optionsvalue`(`queid`,`optionlist`,`imageoption`)VALUES(" + data.insertId + ",'" + req.body.options[i].option + "','" + req.body.options[i].image + "');", function (data, err) {
                        if (err) {
                            console.log(err);

                        } else {

                        }
                    });
                }
                for (let i = 0; i < req.body.answer.length; i++) {
                    db.executeSql("INSERT INTO `answerlist`( `queid`, `answer`) VALUES(" + data.insertId + ",'" + req.body.answer[i].answer + "');", function (data, err) {
                        if (err) {
                            console.log(err);

                        } else {

                        }
                    });

                }
            }
            else {
                console.log(req.body)
                return res.json("success");
            }
            return res.json("success");
        }
    });
});

router.post("/UpdateQuestionList", midway.checkToken, (req, res, next) => {
    console.log(req.body)
    db.executeSql(" UPDATE `questionlist` SET question='" + req.body.question + "',marks=" + req.body.marks + ",time=" + req.body.time + ",quetype='" + req.body.quetype + "',updateddate=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

// router.post("/SaveVisitorDetails", midway.checkToken, (req, res, next) => {
//     db.executeSql("INSERT INTO `visitorreg`( `firstname`, `middlename`, `lastname`, `email`, `password`, `gender`, `contact`, `mothername`, `wappnumber`, `address`, `city`, `pincode`, `standard`, `propic`, `subject`, `school`, `qualification`, `fatherCont`, `motherCont`, `percentage`) VALUES ('" + req.body.firstname + "','" + req.body.middlename + "','" + req.body.lastname + "','" + req.body.email + "','" + req.body.password + "','" + req.body.gender + "'," + req.body.contact + ",'" + req.body.mname + "'," + req.body.wapp + ",'" + req.body.address + "','" + req.body.city + "'," + req.body.pincode + "," + req.body.stdid + ",'" + req.body.profile + "'," + req.body.subid + ",'" + req.body.schoolname + "','" + req.body.lastqualification + "'," + req.body.parents + ",'" + req.body.mnumber + "'," + req.body.percentage + ")", function (data, err) {
//         if (err) {
//             console.log(err);
//         }
//         else {
//             return res.json(data);
//         }
//     })
// })

router.post("/getAllQueList", midway.checkToken, (req, res, next) => {


    db.executeSql("select * from questionlist where subid=" + req.body.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});
router.post("/getQueOptionList", midway.checkToken, (req, res, next) => {
    db.executeSql("select * from optionsvalue where queid=" + req.body.queid + ";", function (data1, err) {
        if (err) {
            console.log(err);
        }
        else {
            return res.json(data1);
        }
    });
})
router.post("/getQueAnswer", midway.checkToken, (req, res, next) => {
    db.executeSql("select * from answerlist where queid=" + req.body.queid + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    });
})
router.post("/SaveTest", midway.checkToken, (req, res, next) => {
    console.log(req.body)
    db.executeSql("INSERT INTO `testlist`( `stdid`, `subjectId`, `totalmarks`, `totalminute`, `testname`, `isactive`, `createdate`, `updateddate`) VALUES (" + req.body.standardId + "," + req.body.subjectId + "," + req.body.totalmarks + "," + req.body.totalduration + ",'" + req.body.testname + "',true,CURRENT_TIMESTAMP,null)", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            data.insertId
            for (let i = 0; i < req.body.questionlist.length; i++) {
                db.executeSql("INSERT INTO `testquelist`(`testid`, `queid`) VALUES (" + data.insertId + "," + req.body.questionlist[i].id + ")", function (data, err) {
                    if (err) {
                        console.log(err)
                    }
                })
            }
            return res.json('success');
        }
    });
})

router.post("/removeQueList", midway.checkToken, (req, res, next) => {
    console.log(req.body)
    db.executeSql("Delete from questionlist where id=" + req.body.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            db.executeSql("Delete from optionsvalue where queid=" + req.body.id, function (data, err) {
                if (err) {
                    console.log(err);

                } else {
                    db.executeSql("Delete from answerlist where queid=" + req.body.id, function (data, err) {
                        if (err) {
                            console.log(err);
                        } else {
                        }
                    });
                }
            });
            return res.json(data);
        }
    });
})

router.post("/saveTeacherList", midway.checkToken, (req, res, next) => {
    console.log(req.body);
    db.executeSql("INSERT INTO `teacherlist`(`firstname`,`lastname`,`qualification`,`contact`,`whatsapp`,`email`,`password`,`address`,`gender`)VALUES('" + req.body.firstname + "','" + req.body.lastname + "','" + req.body.qualification + "','" + req.body.contact + "','" + req.body.Whatsapp + "','" + req.body.email + "','" + req.body.password + "','" + req.body.address + "','" + req.body.gender + "');", function (data, err) {
        if (err) {
            console.log(err);

        } else {
            // console.log(res)
            // console.log(err);
            res.json("success");
        }
    });
});

router.post("/SaveStudentList", midway.checkToken, (req, res, next) => {
    db.executeSql("INSERT INTO `studentlist`(`firstname`,`middlename`,`lastname`,`email`,`password`,`gender`,`dateofbirth`,`contact`,`parents`,`fname`, `mname`, `mnumber`, `pactive`, `mactive`, `cactive`, `batchtime`, `cmmitfee`,`address`,`city`,`pincode`,`standard`,`grnumber`,`propic`)VALUES('" + req.body.firstname + "','" + req.body.middlename + "','" + req.body.lastname + "','" + req.body.email + "','" + req.body.password + "','" + req.body.gender + "',10-07-2021," + req.body.contact + "," + req.body.parents + ",'" + req.body.fname + "','" + req.body.mname + "'," + req.body.mnumber + ",'" + req.body.pactive + "','" + req.body.mactive + "','" + req.body.cactive + "','" + req.body.batchtime + "','" + req.body.cfees + "','" + req.body.address + "','" + req.body.city + "'," + req.body.pincode + ",'" + req.body.standard + "','" + req.body.grnumber + "','" + req.body.profile + "');", function (data, err) {
        if (err) {
            console.log(err)
        } else {

            res.json("success");
        }
    });
});

router.post("/GetStudentList", midway.checkToken, (req, res, next) => {
    console.log(req.body)
    db.executeSql("select * from studentlist where standard=" + req.body.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.post("/GetTestList", midway.checkToken, (req, res, next) => {
    console.log(req.body)
    db.executeSql("select * from testlist where subjectId=" + req.body.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.post("/GetViewTestList", midway.checkToken, (req, res, next) => {
    db.executeSql("select * from testquelist where testid=" + req.body.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            var qlist = [];
            for (let i = 0; i < data.length; i++) {
                db.executeSql("select * from questionlist where id=" + data[i].queid, function (data1, err) {
                    if (err) {
                        console.log("Error in store.js", err);
                    } else {
                        qlist.push(data1[0]);
                        if (qlist.length == data.length) {
                            return res.json(qlist);
                        }
                    }
                });
            }
        }
    });

});


router.post("/GetViewVisitorTestList", midway.checkToken, (req, res, next) => {

    db.executeSql("select * from visitortest where stdid=" + req.body.stdid + " and subjectId=" + req.body.subid, function (data, err) {
        if (err) {
            console.log(err)
        }
        else {
            db.executeSql("select * from visitortestque where testid=" + data[0].id, function (data, err) {
                if (err) {
                    console.log("Error in store.js", err);
                } else {
                    var qlist = [];
                    for (let i = 0; i < data.length; i++) {
                        db.executeSql("select * from visitorquestion where id=" + data[i].queid, function (data1, err) {
                            if (err) {
                                console.log("Error in store.js", err);
                            } else {
                                data1[0].testid = data[0].id;
                                qlist.push(data1[0]);
                                if (qlist.length == data.length) {
                                    return res.json(qlist);
                                }
                            }
                        });
                    }
                }
            });
        }
    })
})

router.post("/GetOptionValueTest", midway.checkToken, (req, res, next) => {
    db.executeSql("select * from optionsvalue where queid=" + req.body.id, function (data, err) {
        if (err) {
            console.log(err);
        }
        else {
            return res.json(data);
        }
    })
});

router.post("/GetOptionValueVisitorTest", midway.checkToken, (req, res, next) => {

    db.executeSql("select * from visitoroptions where queid=" + req.body.id, function (data, err) {
        if (err) {
            console.log(err);
        }
        else {
            return res.json(data);
        }
    })
});


router.get("/GetTeacherList", midway.checkToken, (req, res, next) => {
    db.executeSql("select * from teacherlist  ", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }

    });
});

router.get("/GetAllSubjects", midway.checkToken, (req, res, next) => {
    db.executeSql("select * from subjectlist", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.get("/GetAllStudentList", midway.checkToken, (req, res, next) => {
    db.executeSql("select * from studentlist ", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/GetAllTestList", midway.checkToken, (req, res, next) => {
    console.log(req.body);
    if (req.body.role == 'Admin') {
        db.executeSql("select * from testlist ", function (data, err) {
            if (err) {
                console.log("Error in store.js", err);
            } else {
                return res.json(data);
            }
        });
    }
    else {
        let test = [];
        db.executeSql("select subid from subrightstoteacher where teacherid=" + req.body.teachid, function (data, err) {
            if (err) {
                console.log("Error in store.js", err);
            } else {
                console.log(data);
                for (let i = 0; i < data.length; i++) {
                    db.executeSql("select * from testlist where subjectId=" + data[i].subid, function (data2, err) {
                        if (err) {
                            console.log("Error in store.js", err);
                        }
                        else {
                            if (data2[0] != undefined) {
                                test.push(data2[0]);
                            }
                            if (data.length == (i + 1)) {
                                return res.json(test);
                            }
                        }
                    });

                }
            }
        });
    }
});

let secret = 'prnv';
router.post('/login', function (req, res, next) {

    const body = req.body;
    console.log(body);
    var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
    var repass = salt + '' + body.password;
    var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
    db.executeSql("select * from admin where email='" + req.body.email + "';", function (data, err) {
        console.log(data);
        if (data.length > 0) {
            db.executeSql("select * from admin where email='" + req.body.email + "' and password='" + encPassword + "';", function (data1, err) {
                console.log(data1);
                if (data1.length > 0) {

                    module.exports.user1 = {
                        username: data1[0].email, password: data1[0].password
                    }
                    let token = jwt.sign({ username: data1[0].email, password: data1[0].password },
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

});

router.post("/removeStudentList", midway.checkToken, (req, res, next) => {
    // console.log(req.body.id);
    db.executeSql("Delete from studentlist where id=" + req.body.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.post("/removeTecaherList", midway.checkToken, (req, res, next) => {
    // console.log(req.body.id);
    db.executeSql("Delete from teacherlist where id=" + req.body.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.post("/UpdateTecaherList", midway.checkToken, (req, res, next) => {
    // console.log(req.body)
    db.executeSql("UPDATE `teacherlist` SET `firstname`='" + req.body.firstname + "',`lastname`='" + req.body.lastname + "',`qualification`='" + req.body.qualification + "',`contact`='" + req.body.contact + "',`whatsapp`=" + req.body.whatsapp + ",`email`='" + req.body.email + "',`password`='" + req.body.password + "',`address`='" + req.body.address + "',`gender`='" + req.body.gender + "' WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        }
        else {
            db.executeSql("delete from subrightstoteacher where teacherid=" + req.body.id, function (data1, err) {
                if (err) {
                    console.log(err);
                }
                else {
                    for (let i = 0; i < req.body.rights.length; i++) {
                        for (let j = 0; j < req.body.rights[i].selsubjects.length; j++) {
                            db.executeSql("INSERT INTO `subrightstoteacher`(`teacherid`, `stdid`, `subid`, `updateddate`) VALUES (" + req.body.id + "," + req.body.rights[i].stdid + "," + req.body.rights[i].selsubjects[j].subid + ",null)", function (data1, err) {
                                if (err) {
                                    console.log(err);
                                }
                                else {

                                }
                            })
                        }
                    }
                }
            });
            return res.json('success');
        }
    });
});

router.post("/UpdateStudentList", midway.checkToken, (req, res, next) => {
    console.log(req.body)
    db.executeSql("UPDATE `studentlist` SET `firstname`='" + req.body.firstname + "',`middlename`='" + req.body.middlename + "',`lastname`='" + req.body.lastname + "',`email`='" + req.body.email + "',`gender`='" + req.body.gender + "',`contact`=" + req.body.contact + ",`parents`=" + req.body.parents + ",`fname`='" + req.body.fname + "',`mname`='" + req.body.mname + "',`mnumber`=" + req.body.mnumber + ",`pactive`=" + req.body.pactive + ",`mactive`=" + req.body.mactive + ",`cactive`=" + req.body.cactive + ",`batchtime`='" + req.body.batchtime + "',`cmmitfee`='" + req.body.cmmitfee + "',`address`='" + req.body.address + "',`city`='" + req.body.city + "',`pincode`=" + req.body.pincode + ",`standard`='" + req.body.standard + "',`grnumber`=" + req.body.grnumber + ",`schoolname`='" + req.body.schoolname + "'  WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/UploadProfileImage", midway.checkToken, (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/profile');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/profile/' + req.file.filename);

        if (req.fileValidationError) {
            console.log("err1", req.fileValidationError);
            return res.json("err1", req.fileValidationError);
        } else if (!req.file) {
            console.log('Please select an image to upload');
            return res.json('Please select an image to upload');
        } else if (err instanceof multer.MulterError) {
            console.log("err3");
            return res.json("err3", err);
        } else if (err) {
            console.log("err4");
            return res.json("err4", err);
        }
        return res.json('/images/profile/' + req.file.filename);

        console.log("You have uploaded this image");
    });
});

router.post("/UploadBannersImage", midway.checkToken, (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/banners');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/banners/' + req.file.filename);

        if (req.fileValidationError) {
            console.log("err1", req.fileValidationError);
            return res.json("err1", req.fileValidationError);
        } else if (!req.file) {
            console.log('Please select an image to upload');
            return res.json('Please select an image to upload');
        } else if (err instanceof multer.MulterError) {
            console.log("err3");
            return res.json("err3", err);
        } else if (err) {
            console.log("err4");
            return res.json("err4", err);
        }
        return res.json('/images/banners/' + req.file.filename);

        console.log("You have uploaded this image");
    });
});

router.post("/SaveWebBanners", midway.checkToken, (req, res, next) => {
    // console.log(req.body);
    db.executeSql("INSERT INTO `webbanners`(`name`,`bannersimage`,`status`)VALUES('" + req.body.name + "','" + req.body.bannersimage + "'," + req.body.status + ");", function (data, err) {
        if (err) {
            res.json("error");
        } else {
            res.json("success");
        }
    });
});

router.get("/GetWebBanners", midway.checkToken, (req, res, next) => {
    console.log(req.body.id)
    db.executeSql("select * from webbanners ", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/RemoveWebBanners", midway.checkToken, (req, res, next) => {
    console.log(req.id)
    db.executeSql("Delete from webbanners where id=" + req.body.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/UpdateActiveWebBanners", midway.checkToken, (req, res, next) => {
    console.log(req.body)
    db.executeSql("UPDATE `csquare`.`webbanners` SET status=" + req.body.status + " WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.get("/GetWebBanner", midway.checkToken, (req, res, next) => {
    db.executeSql("select * from webbanners where status=1", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.get("/getStudentTest", midway.checkToken, (req, res, next) => {
    // console.log(req.body.id)
    db.executeSql("select * from testlist ", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/updateSendLink", midway.checkToken, (req, res, next) => {
    console.log('gfyguhufu')
    console.log(req.body);
    db.executeSql("UPDATE `csquare`.`testlist` SET activetest=true,updateddate=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.get("/GetStudentActiveTest", midway.checkToken, (req, res, next) => {
    db.executeSql("select t.id,t.stdid,t.subjectId,t.totalmarks,t.totalminute,t.testname,t.isactive,t.activetest,t.deactivetest,t.createdate,t.updateddate,s.stdname as StdName,su.subject from testlist t join stdlist s on t.stdid=s.id join subjectlist su on t.subjectId = su.id where t.activetest=1 ", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/UpdatePendingTest", midway.checkToken, (req, res, next) => {
    db.executeSql("UPDATE `csquare`.`testlist` SET activetest=0,updateddate=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/SaveStudentTest", midway.checkToken, (req, res, next) => {

    for (i = 0; i < req.body.length; i++) {
        db.executeSql("INSERT INTO `submittedtest`(`studentid`,`testid`,`queid`,`answer`,`marks`,`createddate`)VALUES(" + req.body[i].studentid + "," + req.body[i].testid + "," + req.body[i].id + ",'" + req.body[i].answer + "'," + req.body[i].marks + ",CURRENT_TIMESTAMP);", function (data, err) {
            if (err) {
                console.log(err);
            } else {
                console.log(req.body.length);
                console.log(i);
                if (req.body.length == (i + 1)) {

                }

            }
        });
    }
    return res.json("success");
});

// console.log(otp);


router.post("/ForgetPassword", (req, res, next) => {
    let otp = Math.floor(100000 + Math.random() * 900000);
    console.log(req.body);
    if (req.body.role == 'Teacher') {
        db.executeSql("select * from teacherlist where email='" + req.body.email + "';", function (data, err) {
            if (err) {
                console.log("Error in store.js", err);
                return res.json('err');
            } else {
                console.log(req.body);
                db.executeSql("INSERT INTO `otp`(`userid`, `otp`, `createddate`, `createdtime`,`role`,`isactive`) VALUES (" + data[0].id + "," + otp + ",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'" + req.body.role + "',true)", function (data1, err) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            host: "smtp.gmail.com",
                            port: 465,
                            secure: false, // true for 465, false for other ports
                            auth: {
                                user: 'ptlshubham@gmail.com', // generated ethereal user
                                pass: 'spiderweb@1', // generated ethereal password
                            },
                        });
                        const output = `
                        <h3>One Time Password</h3>
                        <p>To authenticate, please use the following One Time Password(OTP):<h3>`+ otp + `</h3></p>
                        <p>OTP valid for only 2 Minutes.</P>
                        <p>Don't share this OTP with anyone.</p>
                        <a href="http://localhost:4200/password">Change Password</a>
`;
                        const mailOptions = {
                            from: '"KerYar" <ptlshubham@gmail.com>',
                            subject: "Password resetting",
                            to: req.body.email,
                            Name: '',
                            html: output

                        };
                        transporter.sendMail(mailOptions, function (error, info) {
                            console.log('fgfjfj')
                            if (error) {
                                console.log(error);
                                res.json("Errror");
                            } else {
                                console.log('Email sent: ' + info.response);
                                res.json(data);
                            }
                        });
                    }
                })

            }
        });
    }
    else if (req.body.role == 'Student') {
        db.executeSql("select * from studentlist where email='" + req.body.email + "';", function (data, err) {
            if (err) {
                console.log("Error in store.js", err);
                return res.json('err');
            } else {
                console.log(req.body);
                db.executeSql("INSERT INTO `otp`(`userid`, `otp`, `createddate`, `createdtime`,`role`,`isactive`) VALUES (" + data[0].id + "," + otp + ",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'" + req.body.role + "',true)", function (data1, err) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            host: "smtp.gmail.com",
                            port: 465,
                            secure: false, // true for 465, false for other ports
                            auth: {
                                user: 'ptlshubham@gmail.com', // generated ethereal user
                                pass: 'spiderweb@1', // generated ethereal password
                            },
                        });
                        const output = `
                        <h3>One Time Password</h3>
                        <p>To authenticate, please use the following One Time Password(OTP):<h3>`+ otp + `</h3></p>
                        <p>OTP valid for only 2 Minutes.</P>
                        <p>Don't share this OTP with anyone.</p>
                        <a href="http://localhost:4200/password">Change Password</a>
`;
                        const mailOptions = {
                            from: '"KerYar" <ptlshubham@gmail.com>',
                            subject: "Password resetting",
                            to: req.body.email,
                            Name: '',
                            html: output

                        };
                        transporter.sendMail(mailOptions, function (error, info) {
                            console.log('fgfjfj')
                            if (error) {
                                console.log(error);
                                res.json("Errror");
                            } else {
                                console.log('Email sent: ' + info.response);
                                res.json(data);
                            }
                        });
                    }
                })
                console.log(req.body)
            }
        });
    }
    else {
        db.executeSql("select * from admin where email='" + req.body.email + "';", function (data, err) {
            if (err) {
                console.log("Error in store.js", err);
                return res.json('err');
            } else {

                db.executeSql("INSERT INTO `otp`(`userid`, `otp`, `createddate`, `createdtime`,`role`,`isactive`) VALUES (" + data[0].id + "," + otp + ",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'" + req.body.role + "',true)", function (data1, err) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            host: "smtp.gmail.com",
                            port: 465,
                            secure: false, // true for 465, false for other ports
                            auth: {
                                user: 'ptlshubham@gmail.com', // generated ethereal user
                                pass: 'spiderweb@1', // generated ethereal password
                            },
                        });
                        const output = `
                        <h3>One Time Password</h3>
                        <p>To authenticate, please use the following One Time Password(OTP):<h3>` + otp + `</h3></p>
                        <p>OTP valid for only 2 Minutes.</P>
                        <p>Don't share this OTP with anyone.</p>
                        <a href="http://localhost:4200/password">Change Password</a>
`;
                        const mailOptions = {
                            from: '"KerYar" <ptlshubham@gmail.com>',
                            subject: "Password resetting",
                            to: req.body.email,
                            Name: '',
                            html: output

                        };
                        transporter.sendMail(mailOptions, function (error, info) {
                            console.log('fgfjfj')
                            if (error) {
                                console.log(error);
                                res.json("Errror");
                            } else {
                                console.log('Email sent: ' + info.response);
                                res.json(data);
                            }
                        });
                    }
                })
                console.log(req.body)
            }
        });
    }

});

router.post("/GetOneTimePassword", (req, res, next) => {
    console.log(req.body)
    db.executeSql("select * from otp where userid = " + req.body.id + " and otp = " + req.body.otp + " ", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/updatePasswordAccordingRole", (req, res, next) => {
    console.log(req.body)
    var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
    var repass = salt + '' + req.body.password;
    var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
    if (req.body.role == 'Teacher') {
        db.executeSql("UPDATE teacherlist SET password='" + encPassword + "' WHERE id=" + req.body.id + ";", function (data, err) {
            if (err) {
                console.log("Error in store.js", err);
            } else {
                console.log("shsyuhgsuygdyusgdyus", data);
                return res.json(data);
            }
        });
    }
    else if (req.body.role == 'Student') {
        db.executeSql("UPDATE `csquare`.`studentlist` SET password='" + encPassword + "' WHERE id=" + req.body.id + ";", function (data, err) {
            if (err) {
                console.log("Error in store.js", err);
            } else {
                return res.json(data);
            }
        });
    }
    else {
        db.executeSql("UPDATE `csquare`.`admin` SET password='" + encPassword + "' WHERE id=" + req.body.id + ";", function (data, err) {
            if (err) {
                console.log("Error in store.js", err);
            } else {
                return res.json(data);
            }
        });
    }
});

router.post("/UploadQuestionImage", midway.checkToken, (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/questions');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/questions/' + req.file.filename);

        if (req.fileValidationError) {
            console.log("err1", req.fileValidationError);
            return res.json("err1", req.fileValidationError);
        } else if (!req.file) {
            console.log('Please select an image to upload');
            return res.json('Please select an image to upload');
        } else if (err instanceof multer.MulterError) {
            console.log("err3");
            return res.json("err3", err);
        } else if (err) {
            console.log("err4");
            return res.json("err4", err);
        }
        console.log(res.json);
        return res.json('/images/questions/' + req.file.filename);


    });
});

router.post("/UploadOptionsImage", midway.checkToken, (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/options');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/options/' + req.file.filename);

        if (req.fileValidationError) {
            console.log("err1", req.fileValidationError);
            return res.json("err1", req.fileValidationError);
        } else if (!req.file) {
            console.log('Please select an image to upload');
            return res.json('Please select an image to upload');
        } else if (err instanceof multer.MulterError) {
            console.log("err3");
            return res.json("err3", err);
        } else if (err) {
            console.log("err4");
            return res.json("err4", err);
        }
        return res.json('/images/options/' + req.file.filename);

        console.log("You have uploaded this image");
    });
});

router.post("/saveCalendarEvents", midway.checkToken, (req, res, next) => {
    console.log(req.body);
    db.executeSql("INSERT INTO `events`(`date`,`title`,`active`,`createddate`)VALUES('" + req.body.date + "','" + req.body.title + "'," + req.body.active + ",CURRENT_TIMESTAMP);", function (data, err) {
        if (err) {
            res.json("error");
        } else {
            res.json("success");
        }
    });
});

router.get("/getCalendarEvents", midway.checkToken, (req, res, next) => {
    db.executeSql("select * from events", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/GetStudentProfilePic", midway.checkToken, (req, res, next) => {
    console.log(req.body)
    db.executeSql("select * from studentlist where id=" + req.body.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/RemoveEventList", midway.checkToken, (req, res, next) => {
    console.log(req.body.id)
    db.executeSql("Delete from events where id=" + req.body.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/saveStudentAttandance", midway.checkToken, (req, res, next) => {
    console.log(req.body)
    for (let i = 0; i < req.body.length; i++) {
        db.executeSql("INSERT INTO `studentattandance`(`stuid`,`date`,`title`,`isactive`,`createddate`)VALUES(" + req.body[i].stuid + ",'" + req.body[i].date + "','" + req.body[i].title + "',1,CURRENT_TIMESTAMP);", function (data, err) {
            if (err) {
                console.log(err)
            } else {

            }
        });
    }
    res.json("success");
});

router.post("/getStudentAttandance", midway.checkToken, (req, res, next) => {
    db.executeSql("select * from studentattandance where stuid=" + req.body.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/SaveVisitorQueList", midway.checkToken, (req, res, next) => {
    console.log(req.body)
    db.executeSql("INSERT INTO `visitorquestion`(`stdid`,`subid`,`question`,`marks`,`time`,`quetype`,`isactive`)VALUES(" + req.body.stdid + "," + req.body.subid + ",'" + req.body.question + "'," + req.body.marks + "," + req.body.time + ",'" + req.body.quetype + "',false);", function (data, err) {

        if (err) {
            console.log(err);
        } else {
            if (req.body.quetype == 'MCQ') {
                console.log(data.insertId);
                for (let i = 0; i < req.body.options.length; i++) {
                    db.executeSql("INSERT INTO `csquare`.`visitoroptions`(`queid`,`optionlist`)VALUES(" + data.insertId + ",'" + req.body.options[i].option + "');", function (data, err) {
                        if (err) {
                            console.log(err);

                        } else {

                        }
                    });
                }
                for (let i = 0; i < req.body.answer.length; i++) {
                    db.executeSql("INSERT INTO `visitoranswer`( `queid`, `answer`) VALUES(" + data.insertId + ",'" + req.body.answer[i].answer + "');", function (data, err) {
                        if (err) {
                            console.log(err);

                        } else {

                        }
                    });

                }
            }
            else {
                console.log(req.body)
                return res.json("success");
            }
            return res.json("success");
        }
    });
});


router.post("/GetVisitorQue", (req, res, next) => {
    console.log(req.body)
    db.executeSql("select * from visitorquestion where subid=" + req.body.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});



router.post("/ChackForPassword", midway.checkToken, (req, res, next) => {
    if (req.body.role == 'Teacher') {
        var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
        var repass = salt + '' + req.body.pass;
        var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
        db.executeSql("select * from teacherlist where id=" + req.body.id + " and password='" + encPassword + "'", function (data, err) {
            if (err) {
                console.log(err);
            }
            else {
                return res.json(data)
            }
        })

    }
    else if (req.body.role == 'Student') {
        var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
        var repass = salt + '' + req.body.pass;
        var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
        db.executeSql("select * from studentlist where id=" + req.body.id + " and password='" + encPassword + "'", function (data, err) {
            if (err) {
                console.log(err);
            }
            else {
                return res.json(data)
            }
        })
    }
    else {
        var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
        var repass = salt + '' + req.body.pass;
        var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
        db.executeSql("select * from admin where id=" + req.body.id + " and password='" + encPassword + "'", function (data, err) {
            if (err) {
                console.log(err);
            }
            else {
                return res.json(data)
            }
        })
    }
})

router.post("/RemoveVisitorQue", (req, res, next) => {
    console.log(req.body)
    db.executeSql("Delete from visitorquestion where id=" + req.body.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            db.executeSql("Delete from visitoroptions where queid=" + req.body.id, function (data, err) {
                if (err) {
                    console.log(err);

                } else {
                    db.executeSql("Delete from visitoranswer where queid=" + req.body.id, function (data, err) {
                        if (err) {
                            console.log(err);
                        } else {
                        }
                    });
                }
            });
            return res.json(data);
        }
    });
})

router.post("/SaveVisitorTest", (req, res, next) => {
    console.log(req.body)
    db.executeSql("INSERT INTO `visitortest`( `stdid`, `subjectId`, `totalmarks`, `totalminute`, `testname`, `isactive`, `createdate`) VALUES (" + req.body.stdId + "," + req.body.subjectId + "," + req.body.totalmarks + "," + req.body.totalduration + ",'" + req.body.testname + "',true,CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            data.insertId
            for (let i = 0; i < req.body.questionlist.length; i++) {
                db.executeSql("INSERT INTO `visitortestque`(`testid`, `queid`) VALUES (" + data.insertId + "," + req.body.questionlist[i].id + ")", function (data, err) {
                    if (err) {
                        console.log(err)
                    }
                })
            }
            return res.json('success');
        }
    });
})
router.post("/GetVisitorTest", (req, res, next) => {
    console.log(req.body)
    db.executeSql("select * from visitortest where subjectId=" + req.body.id, function (data, err) {
        if (err) {
            console.log(err);
        }
        else {
            return res.json(data);

        }
    })

})

router.post("/GetSubmittedTest", midway.checkToken, (req, res, next) => {
    db.executeSql("select t.id,t.studentid,t.queid,t.answer,t.marks,s.subjectId as subid,s.testname,s.totalmarks,s.id as testid from  testlist s  join submittedtest t on t.testid=s.id  where t.studentid=" + req.body.id, function (data, err) {
        if (err) {
            console.log(err);
        }
        else {
            return res.json(data);

        }
    })

});
router.post("/SaveTestResult", midway.checkToken, (req, res, next) => {
    let totalmarks = 0;
    for (let i = 0; i < req.body.question.length; i++) {
        if (req.body.question[i].answer == 'undefined') {
            req.body.question[i].answer = '-';
        }
        db.executeSql("INSERT INTO `testresult`(`testid`, `stdid`, `subid`, `studentid`, `totalmarks`, `obtainmarks`, `remark`, `createddate`, `answer`,`status`) VALUES (" + req.body.testid + "," + req.body.stdid + "," + req.body.subid + "," + req.body.studentid + "," + req.body.question[i].marks + "," + req.body.question[i].obtainmarks + ",'" + req.body.question[i].remark + "',CURRENT_TIMESTAMP,'" + req.body.question[i].answer + "',true)", function (data, err) {
            if (err) {
                console.log(err);
            }
            else {

                totalmarks = totalmarks + req.body.question[i].obtainmarks;
                if ((i + 1) == req.body.question.length) {
                    // return res.json('success');
                    db.executeSql("INSERT INTO `finalresult`( `testid`, `totalmarks`, `createddate`, `studentid`) VALUES (" + req.body.testid + "," + totalmarks + ",CURRENT_TIMESTAMP," + req.body.studentid + ")", function (data1, err) {
                        if (err) {
                            console.log(err)
                        } else {
                            return res.json('success');
                        }
                    })

                }
            }
        })
    }

})

router.post("/getTestforChecking", midway.checkToken, (req, res, next) => {
    console.log(req.body);
    db.executeSql("select t.id ,t.question,t.imageque,t.marks,t.quetype,s.answer from questionlist t join submittedtest s on t.id=s.queid  where s.testid=" + req.body.testid + " and s.studentid=" + req.body.stuid, function (data, err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(data);
            return res.json(data);
        }
    })
});

router.post("/GetSubjectByIdURL", midway.checkToken, (req, res, next) => {
    console.log(req.body)
    db.executeSql("select * from subjectlist where stdid=" + req.body.id, function (data, err) {
        if (err) {
            console.log(err);
        }
        else {
            return res.json(data);

        }
    })

})

router.get("/GetAllVisitor", midway.checkToken, (req, res, next) => {
    db.executeSql("select * from visitorreg", function (data, err) {
        if (err) {
            console.log(err);
        }
        else {
            return res.json(data);

        }
    })

})

router.post("/UpdateVisitorInform", (req, res, next) => {
    db.executeSql("UPDATE `csquare`.`visitorreg` SET isactive=" + req.body.isactive + " WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/GetVisitorTestList", (req, res, next) => {
    db.executeSql("select * from visitortest where subjectId=" + req.body.id, function (data, err) {
        if (err) {
            console.log(err);
        }
        else {
            return res.json(data);
        }
    })
});
router.post("/SaveVisitorStudentTest", (req, res, next) => {
    console.log(req.body);
    let totalmarks = 0;
    for (i = 0; i < req.body.length; i++) {
        db.executeSql("INSERT INTO `visitorsubmittedtest`(`studentid`,`testid`,`queid`,`answer`,`marks`,`createddate`)VALUES(" + req.body[i].uid + "," + req.body[i].testid + "," + req.body[i].id + ",'" + req.body[i].answer + "'," + req.body[i].marks + ",CURRENT_TIMESTAMP);", function (data, err) {
            if (err) {
                console.log(err);
            } else {
                //  console.log(req.body[i]);
                // console.log(i);
                // db.executeSql("select * from visitoranswer where queid="+req.body[i].id,function(data1,err){
                //     if(err){
                //         console.log(err);
                //     }
                //     else{
                //         if(req.body[i].answer == data1[0].answer){
                //             totalmarks = totalmarks + data[i].marks;
                //         }
                //         if((req.body.length -1)==i){
                //             return res.json(totalmarks);
                //         }

                //     }
                // })


                // if (req.body.length == (i + 1)) {


                // }
                // return res.json("success");
            }
        });
    }
    return res.json("success");

});

router.post("/GetVisitorResult", (req, res, next) => {
    db.executeSql("select * from visitorsubmittedtest where studentid=" + req.body.uid, function (data, err) {
        if (err) {
            console.log(err);
        }
        else {
            let totalmarks = 0;
            let k = 1;
            for (let i = 0; i < data.length; i++) {
                db.executeSql("select * from visitoranswer where queid=" + data[i].queid, function (data1, err) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log(data.length);
                        console.log(k + ":" + data[i].answer + "--" + data1[0].answer);

                        if (data[i].answer == data1[0].answer) {
                            totalmarks = totalmarks + data[i].marks;
                        }
                        if (k == data.length) {
                            return res.json(totalmarks);
                        }
                        k++;
                    }
                })
            }
        }
    })
});

router.post("/UpdateVisitorResult", (req, res, next) => {
    db.executeSql("Update visitorreg set ObtainMarks=" + req.body.marks + " where id=" + req.body.uid, function (data, err) {
        if (err) {
            console.log(err)
        }
        else {
            console.log("ddedeeeee");
            return res.json('success');
        }
    })
})

router.post("/setStatusOfTest", midway.checkToken, (req, res, next) => {
    db.executeSql("INSERT INTO `testattempt`(`testid`, `stuid`, `status`, `createddate`)VALUES(" + req.body.testid + "," + req.body.stuid + ",'" + req.body.status + "',CURRENT_TIMESTAMP);", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }
    });
});

router.post("/updateStatusOfTest", midway.checkToken, (req, res, next) => {
    console.log(req.body);
    db.executeSql("Update testattempt set status='" + req.body.status + "'  where testid=" + req.body.testid, function (data, err) {
        if (err) {
            console.log(err)
        }
        else {
            res.json(data);
        }
    })
});



function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });

    return uuid;
}


module.exports = router;