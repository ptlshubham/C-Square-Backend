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


router.post("/SaveMainCategory", midway.checkToken, (req, res, next) => {
    console.log(req.body);
    db.executeSql("INSERT INTO `category`(`name`,`parent`,`bannersimage`,`createddate`,`updateddate`,`isactive`)VALUES('" + req.body.name + "'," + req.body.parent + ",'" + req.body.bannersimage + "',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP," + req.body.isactive + ");", function (data, err) {
        console.log(req.err)
        if (err) {
            res.json("error");
        } else {
            // res.json("success");
            db.executeSql("SELECT id FROM category ORDER BY createddate DESC LIMIT 1", function (data1, err) {
                if (err) {
                    console.log("Error in store.js", err);
                } else {
                    db.executeSql("update `category` set bannersimage='"+req.body.bannersimage+"'  where id="+data1[0].id,function (data, err) {
                        if (err) {
                            console.log("Error in store.js", err);
                        } else {
                            console.log(data);
                            return res.json("success");
                        }
                    });
                }
            });


        }
    });
});
router.post("/SaveBankListCategory", midway.checkToken, (req, res, next) => {
    console.log(req.body.name);
    db.executeSql("INSERT INTO `banklist`(`bankname`)VALUES('" + req.body.bankname + "');", function (data, err) {
        if (err) {
            res.json("error");
        } else {

            res.json("success");
        }
    });
});

router.get("/GetClothsSize", midway.checkToken, (req, res, next) => {
    db.executeSql("select * from clothsize ", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.get("/GetReviewList", (req, res, next) => {
    db.executeSql("select * from ratings ", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});
router.get("/GetBankList", (req, res, next) => {
    db.executeSql("select * from banklist ", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.get("/GetROIList", midway.checkToken, (req, res, next) => {
    db.executeSql("select e.id,e.bankid,e.months,e.intrest,b.id as BankId,b.bankname from emi e join banklist b on e.bankid=b.id", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/GetOrdersList", midway.checkToken, (req, res, next) => {
    console.log('ygyguhguft')
    db.executeSql("select o.id,o.username,o.userid,o.addressid,o.productid,o.quantity,o.transactionid,o.modofpayment,o.total,o.status,o.orderdate,o.deliverydate,p.id as ProductId,p.productName,p.brandName,p.manufacturerName,p.startRating,p.productPrice,p.discountPrice,p.avibilityStatus,p.descripition,p.productMainImage, ad.address ,ad.city,ad.state,ad.pincode,ad.contactnumber from orders o inner join product p on o.productid=p.id inner join useraddress ad on ad.id = o.addressid where o.status='" + req.body.status + "';", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/RemoveROIList", midway.checkToken, (req, res, next) => {

    console.log(req.body.id);
    db.executeSql("Delete from emi where id=" + req.body.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})
router.get("/GetCustomerList", (req, res, next) => {
    db.executeSql("select * from user ", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});
router.get("/GetMainCategory/:id", (req, res, next) => {
    db.executeSql("select * from category where isactive=1 AND parent =" + req.params.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});
router.post("/UpdateMainCategory", midway.checkToken, (req, res, next) => {
    db.executeSql("UPDATE `ecommerce`.`category` SET name='" + req.body.name + "',updateddate=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});
router.post("/UpdateCategory", midway.checkToken, (req, res, next) => {
    console.log(req.body);
    db.executeSql("UPDATE `ecommerce`.`category` SET parent=" + req.body.parent + ",bannersimage='"+req.body.bannerimage+"',name='" + req.body.name + "',updateddate=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/UpdateOrdersStatus", midway.checkToken, (req, res, next) => {
    console.log('accept');
    console.log(req.body);
    db.executeSql("UPDATE `ecommerce`.`orders` SET status='"+req.body.status+"' WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/AcceptUserOrders", midway.checkToken, (req, res, next) => {
    console.log('accept');
    console.log(req.body);
    db.executeSql("UPDATE `ecommerce`.`orders` SET status= 'Accepted' WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/ChangeOrdersStatus", midway.checkToken, (req, res, next) => {
    console.log('accept');
    console.log(req.body);
    db.executeSql("UPDATE `ecommerce`.`orders` SET status= 'Accepted' WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});
router.get("/GetProductList", midway.checkToken, (req, res, next) => {

    db.executeSql("select p.id,p.productName,p.brandName,p.manufacturerName,p.productCode,p.startRating,p.productSRNumber,p.productPrice,p.discountPrice,p.emiOptions,p.avibilityStatus,p.descripition,p.relatedProduct,p.productSize,p.itemWeight,p.isActive,p.mainCategory,p.category,p.subCategory,p.productMainImage,p.createddate,p.updateddate,p.isNewArrival,p.isBestProduct,p.isHot,p.isOnSale from product p ", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});
router.post("/GetProductSizeList", midway.checkToken, (req, res, next) => {

    console.log(req.body);
    db.executeSql("select * from quantitywithsize where productid=" + req.body.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.get("/RemoveMainCategory/:id", midway.checkToken, (req, res, next) => {
    db.executeSql("UPDATE `ecommerce`.`category` SET updateddate=CURRENT_TIMESTAMP,isactive=0 WHERE id=" + req.params.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});


router.post("/SaveAddProducts", midway.checkToken, (req, res, next) => {
    console.log(req.body)
    if (req.body.id == undefined || req.body.id == null) {
        db.executeSql("INSERT INTO `product`(`productName`,`brandName`,`manufacturerName`,`productCode`,`startRating`,`productSRNumber`,`productPrice`,`discountPrice`,`emiOptions`,`avibilityStatus`,`descripition`,`relatedProduct`,`productSize`,`itemWeight`,`isActive`,`mainCategory`,`category`,`subCategory`,`productMainImage`,`createddate`)VALUES('" + req.body.productName + "','" + req.body.brandName + "','" + req.body.manufacturerName + "'," + req.body.productCode + "," + req.body.startRating + ",'" + req.body.productSRNumber + "'," + req.body.productPrice + "," + req.body.discountPrice + "," + req.body.emiOptiions + "," + req.body.avibilityStatus + ",'" + req.body.descripition + "'," + req.body.relatedProduct + ",'" + req.body.productSize + "','" + req.body.itemWeight + "'," + req.body.isActive + "," + req.body.mainCategory + "," + req.body.category + "," + req.body.subCategory + ",'" + req.body.productMainImage + "',CURRENT_TIMESTAMP);", function (data, err) {
            if (err) {
                console.log("Error in store.js", err);
            } else {
                db.executeSql("SELECT id FROM product ORDER BY createddate DESC LIMIT 1", function (data1, err) {
                    if (err) {
                        console.log("Error in store.js", err);
                    } else {
                        console.log("CCCFFFFGF", req.body.selectedSize);
                        req.body.selectedSize.forEach(element => {
                            db.executeSql("INSERT INTO `quantitywithsize`(`productid`,`quantity`,`size`,`color`,`soldquantity`,`stockdate`)VALUES(" + data1[0].id + ",'" + element.quantity + "','" + element.selsize + "','"+element.color+"','"+element.soldquantity+"',CURRENT_TIMESTAMP);", function (data, err) {
                                if (err) {
                                    console.log("Error in store.js", err);
                                } else {
                                    console.log(req.body.multi)

                                }
                            });


                        })
                        for (let i = 0; i < req.body.multi.length; i++) {
                            db.executeSql("INSERT INTO `images`(`mainCategoryId`,`productid`,`categoryId`,`subCategoryId`,`productListImage`,`createddate`)VALUES(" + req.body.mainCategory + "," + data1[0].id + "," + req.body.category + "," + req.body.subCategory + ",'" + req.body.multi[i] + "',CURRENT_TIMESTAMP);", function (data, err) {
                                if (err) {
                                    console.log("Error in store.js", err);
                                } else { }
                            });
                        }
                    }
                });
            }
        })
        res.json("success");
    }
    else {
        db.executeSql("UPDATE `product` SET `productName`='" + req.body.productName + "',`brandName`='" + req.body.brandName + "',`manufacturerName`='" + req.body.manufacturerName + "',`productCode`=" + req.body.productCode + ",`startRating`=" + req.body.startRating + ",`productSRNumber`=" + req.body.productSRNumber + ",`productPrice`=" + req.body.productPrice + ",`discountPrice`=" + req.body.discountPrice + ",`emiOptions`=" + req.body.emiOptiions + ",`avibilityStatus`=" + req.body.avibilityStatus + ",`descripition`='" + req.body.descripition + "',`relatedProduct`='" + req.body.relatedProduct + "',`productSize`='" + req.body.productSize + "',`itemWeight`='" + req.body.itemWeight + "',`isActive`=" + req.body.isActive + ",`mainCategory`=" + req.body.mainCategory + ",`category`=" + req.body.category + ",`subCategory`=" + req.body.subCategory + ",`productMainImage`=" + req.body.productMainImage + ",`updateddate`=CURRENT_TIMESTAMP WHERE id=" + req.body.id, function (data, err) {
            if (err) {
                console.log("Error in store.js", err);
            } else {
                return res.json(data);
            }
        });
    }

});
router.post("/UpdateReviews", midway.checkToken, (req, res, next) => {
    console.log(req.body)
    db.executeSql("UPDATE `ecommerce`.`ratings` SET rating=" + req.body.rating + ",comment='" + req.body.comment + "',updateddate=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});


router.get("/RemoveReviews/:id", midway.checkToken, (req, res, next) => {

    console.log(req.params.id);
    db.executeSql("Delete from ratings where id=" + req.params.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})
router.get("/RemoveProduct/:id", midway.checkToken, (req, res, next) => {

    console.log(req.params.id);
    db.executeSql("Delete from product where id=" + req.params.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            db.executeSql("Delete from images where id=" + req.params.id, function (data, err) {
                if (err) {
                    console.log("Error in store.js", err);
                } else {
                    db.executeSql("Delete from quantitywithsize where id=" + req.params.id, function (data, err) {
                        if (err) {
                            console.log("Error in store.js", err);
                        } else {
                            return res.json(data);
                        }
                    });
                }
            });
        }
    });
})

let secret = 'prnv';
router.post('/login', function (req, res, next) {
    console.log("ggggggg");
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

router.post("/SaveAdminRegister", (req, res, next) => {
    console.log("vdfvfvfv");
    var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
    var repass = salt + '' + req.body.password;
    var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
    db.executeSql("INSERT INTO `admin`(`firstname`,`lastname`,`email`,`password`,`isactive`)VALUES('" + req.body.firstname + "','" + req.body.lastname + "','" + req.body.email + "','" + encPassword + "'," + req.body.isactive + ");", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});
router.post("/getProductDetailImage", (req, res, next) => {
    db.executeSql("select * from images where productid=" + req.body.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})
router.post("/SaveWebBanners", (req, res, next) => {
    console.log(req.body);
    db.executeSql("INSERT INTO `webbanners`(`name`,`bannersimage`,`status`)VALUES('" + req.body.name + "','" + req.body.bannersimage + "'," + req.body.status + ");", function (data, err) {
        if (err) {
            res.json("error");
        } else {
            res.json("success");
        }
    });
});
router.post("/UpdateActiveWebBanners", midway.checkToken, (req, res, next) => {
    console.log(req.body)
    db.executeSql("UPDATE `ecommerce`.`webbanners` SET status=" + req.body.status + " WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});
router.post("/SaveMobileBanners", midway.checkToken, (req, res, next) => {
    console.log(req.body);

    db.executeSql("INSERT INTO `mobilebanners`(`name`,`bannersimage`,`status`)VALUES('" + req.body.name + "','" + req.body.bannersimage + "'," + req.body.status + ");", function (data, err) {
        if (err) {
            console.log(err);
            res.json("error");
        } else {
            res.json("success");
        }
    });
});
router.post("/UpdateActiveMobileBanners", midway.checkToken, (req, res, next) => {
    console.log(req.body)
    db.executeSql("UPDATE `ecommerce`.`mobilebanners` SET status=" + req.body.status + " WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.get("/GetMobileBanners", (req, res, next) => {
    db.executeSql("select * from mobilebanners ", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/RemoveMobileBanners", midway.checkToken, (req, res, next) => {
    console.log(req.body.id)
    db.executeSql("Delete from mobilebanners where id=" + req.body.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});


router.post("/getFilterProductList", midway.checkToken, (req, res, next) => {
    console.log(req.body);
    db.executeSql("select * from product  where mainCategory=" + req.body.maincatid + " OR category=" + req.body.catid + " OR subCategory=" + req.body.subid + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);

        }
    });
});
router.post("/GetAllFilterProduct", (req, res, next) => {
    if(req.body.filter == 'hot'){
        db.executeSql("select * from product where isHot=1", function(data, err) {
            if (err) {
                console.log("Error in store.js", err);
            } else {
                return res.json(data);
            }
        });
    }
    else if(req.body.filter == 'best'){
        db.executeSql("select * from product where isBestProduct=1", function(data, err) {
            if (err) {
                console.log("Error in store.js", err);
            } else {
                return res.json(data);
            }
        });
    }
    else if(req.body.filter == 'sale'){
        db.executeSql("select * from product where isOnSale=1", function(data, err) {
            if (err) {
                console.log("Error in store.js", err);
            } else {
                return res.json(data);
            }
        });
    }
    else{
        db.executeSql("select * from product where isNewArrival=1", function(data, err) {
            if (err) {
                console.log("Error in store.js", err);
            } else {
                return res.json(data);
            }
        });
    }
    
   
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

router.post("/UploadProductImage", midway.checkToken, (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/products');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/products/' + req.file.filename);

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
        return res.json('/images/products/' + req.file.filename);

        console.log("You have uploaded this image");
    });
});

router.post("/UploadMultiProductImage", midway.checkToken, (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/products');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + '/images/products/' + req.file.filename);

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
        return res.json('/images/products/' + req.file.filename);
        console.log("You have uploaded this image");
    });
});


router.get("/RemoveRecentUoloadImage", midway.checkToken, (req, res, next) => {
    console.log(req.body);
    db.executeSql("SELECT * FROM images ORDER BY createddate DESC LIMIT 1", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})
router.post("/UploadCategoryBannersImage", (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/categorybanners/');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/categorybanners/' + req.file.filename);

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
        return res.json('/images/categorybanners/' + req.file.filename);

        console.log("You have uploaded this image");
    });
});
router.post("/UploadBannersImage", (req, res, next) => {
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
router.post("/UploadMobileBannersImage", (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/mobilebanners');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/mobilebanners/' + req.file.filename);

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
        return res.json('/images/mobilebanners/' + req.file.filename);

        console.log("You have uploaded this image");
    });
});

router.post("/saveEmioption", midway.checkToken, (req, res, next) => {
    console.log(req.body);
    for (let i = 0; i < req.body.length; i++) {
        db.executeSql("INSERT INTO `ecommerce`.`emi`(`bankid`,`months`,`intrest`,`isactive`,`createddate`,`updateddate`)VALUES(" + req.body[i].bankid + "," + req.body[i].months + "," + req.body[i].intrest + ",true,CURRENT_TIMESTAMP,NULL);", function (data, err) {
            if (err) {
                console.log(err);

            } else {

            }
        });
    }

    res.json("success");


});

//filter apis
router.post("/addToNewArrivals", midway.checkToken, (req, res, next) => {
    console.log(req.body);
    for (let i = 0; i < req.body.length; i++) {
        db.executeSql("update `ecommerce`.`product` SET isNewArrival=true,isBestProduct=false,isHot=false,isOnSale=false where id=" + req.body[i].id, function (data, err) {
            if (err) {
                console.log(err);

            } else {

            }
        });
    }
    res.json("success");

});

router.post("/addToBestProduct", midway.checkToken, (req, res, next) => {
    for (let i = 0; i < req.body.length; i++) {
        db.executeSql("update `ecommerce`.`product` SET isNewArrival=false,isBestProduct=true,isHot=false,isOnSale=false where id=" + req.body[i].id, function (data, err) {
            if (err) {
                console.log(err);

            } else {

            }
        });
    }
    res.json("success");

});
router.post("/addToHotProduct", midway.checkToken, (req, res, next) => {
    for (let i = 0; i < req.body.length; i++) {
        db.executeSql("update `ecommerce`.`product` SET isNewArrival=false,isBestProduct=false,isHot=true,isOnSale=false where id=" + req.body[i].id, function (data, err) {
            if (err) {
                console.log(err);

            } else {

            }
        });
    }
    res.json("success");

});
router.post("/addToOnSale", midway.checkToken, (req, res, next) => {
    for (let i = 0; i < req.body.length; i++) {
        db.executeSql("update `ecommerce`.`product` SET isNewArrival=false,isBestProduct=false,isHot=false,isOnSale=true where id=" + req.body[i].id, function (data, err) {
            if (err) {
                console.log(err);

            } else {

            }
        });
    }
    res.json("success");

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