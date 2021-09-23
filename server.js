const path = require('path');
const express = require('express');
const app = express();
const multer = require("multer");
const bodyParser = require('body-parser');
const axios = require('axios')
const qs = require('querystring')
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));
const port = process.env.PORT || 3000
const mysql = require('mysql2');
imgurl = "";
var cookieParser = require('cookie-parser');
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'homedecor',

  // multipleStatements: true
});


/*const conn = mysql.createConnection({
  host: 'tvcpw8tpu4jvgnnq.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  user: 'cxj1bkxymyq64zbr',
  password: 'hv2puas3h25ato4i',
  database: 'wen6qgrav24dztfv',
  multipleStatements: true
});*/



app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads")
  },
  filename: function (req, file, cb) {
    imgurl = file.fieldname + "-" + Date.now() + ".jpg";
    cb(null, imgurl)
  }
})
app.use(cookieParser());
const maxSize = 1 * 1000 * 1000;

var upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: function (req, file, cb) {

    var filetypes = /jpeg|jpg|png/;
    var mimetype = filetypes.test(file.mimetype);

    var extname = filetypes.test(path.extname(
      file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }

    cb("Error: File upload only supports the "
      + "following filetypes - " + filetypes);
  }
}).single("imgupload");

app.post("/submitproduct", function (req, res, next) {
  upload(req, res, function (err) {

    if (err) {
      res.send(err)
    }
    else {
      console.log("req.query.pid", req.body);
      sql = "insert into products values(DEFAULT,'" + req.body.category + "','" + req.body.producttype + "','" + imgurl + "','" + req.body.price + "','" + req.body.company + "','" + req.body.size + "','" + req.body.isnewarrival + "')";
      let query = conn.query(sql, function (err, myresults) {
        if (err) throw err;
        let sql = `SELECT productid,c.categoryname, pt.producttypename,sm.sizename,productimgurl,price,brand,isnewarrival FROM homedecor.products as p inner join homedecor.category as c on c.categoryid=p.categoryid
  inner join homedecor.producttype as pt on pt.producttypeid=p.producttypeid
  inner join homedecor.sizemaster as sm on sm.sizeid=p.sizeid`;
        let query = conn.query(sql, function (err, myresults) {
          if (err) throw err;
          res.render(__dirname + '/viewproduct.ejs', {
            results: myresults
          });
        });
        // res.send("Success, Image uploaded!" + req.body.producttype);
      });
    }
  })
})



conn.connect(function (err) {
  if (err) throw (err);
  console.log('Mysql Connected...');
});

app.get('/', function (req, res) {
  res.clearCookie('email');
  res.clearCookie('password');
  res.render(__dirname + "/homepage1");
});

app.get('/home', function (req, res) {
  res.clearCookie('email');
  res.clearCookie('password');
  res.render(__dirname + "/homepage1");
});

app.get('/signhome', function (req, res) {
  res.render(__dirname + "/signInHome");
});



/*app.get('/Signin',function(req,res){
  res.sendFile(path.join(__dirname, '/signin.html'));
});*/


app.get('/myorder', function (req, res) {
  var userEmail = req.cookies.email
  // let data = { productId: req.body.productId, price: req.body.productCost, isOrderd: false };
  let sql = `select c.id as cartId, p.productimgurl as pImg, p.productid as productId, pt.producttypename, sum(c.price) as ptotal, p.brand, c.price, c.userEmail, count(c.productId) as Quantity from homedecor.cart as c inner join homedecor.products as p on p.productid = c.productid 
  inner join homedecor.producttype as pt on pt.producttypeid=p.producttypeid
  where isOrderd=true 
  And userEmail="${userEmail}"
   group by c.productId`;
  let query = conn.query(sql, function (err, myresults) {
    let query = conn.query(sql, function (err, myresults) {
      if (err) throw err;
      res.render(__dirname + '/orderid1', {
        results: myresults
      });
    });
  })
});


app.get('/forgotpassword', function (req, res) {
  res.render(__dirname + "/forgotpassword");
});

app.get('/checkout', function (req, res) {
  res.render(__dirname + "/checkout");
});

app.get('/oid1', function (req, res) {
  res.render(__dirname + "/orderid1");
});

app.get('/oid2', function (req, res) {
  res.render(__dirname + "/orderid2");
});

app.get('/oid3', function (req, res) {
  res.render(__dirname + "/orderid3");
});

app.get('/placedorder', function (req, res) {
  res.render(__dirname + "/placedorder");
});

app.get('/cart', function (req, res) {
  res.render(__dirname + "/cart");
});

app.get('/register', function (req, res) {
  res.render(__dirname + "/reg");
});

app.get('/back', function (req, res) {
  res.render(__dirname + "/homepage1");
});


app.get('/newarrival', function (req, res) {
  var userEmail = req.cookies.email
  let sql = `SELECT productid,c.categoryname, pt.producttypename,sm.sizename,productimgurl,price,brand,isnewarrival FROM homedecor.products as p inner join homedecor.category as c on c.categoryid=p.categoryid
  inner join homedecor.producttype as pt on pt.producttypeid=p.producttypeid
  inner join homedecor.sizemaster as sm on sm.sizeid=p.sizeid where isnewarrival =  true`;
  let query = conn.query(sql, function (err, myresults) {
    if (err) throw err;
    if (userEmail == "" || userEmail == undefined) {
      res.render(__dirname + '/newarrivals', {
        results: myresults
      });
    }
    else {
      res.render(__dirname + '/sigInNewarrivals', {
        results: myresults
      });
    }
  });
});

/*app.get('/home',function(req,res){
  res.sendFile(path.join(__dirname, '/homepage1.html'));
});*/

app.get('/bdouble', function (req, res) {
  var userEmail = req.cookies.email
  let sql = `SELECT productid,c.categoryname, pt.producttypename,sm.sizename,productimgurl,price,brand,isnewarrival FROM homedecor.products as p inner join homedecor.category as c on c.categoryid=p.categoryid
  inner join homedecor.producttype as pt on pt.producttypeid=p.producttypeid
  inner join homedecor.sizemaster as sm on sm.sizeid=p.sizeid where producttypename="bedsheet" AND sizename="Double"`;
  let query = conn.query(sql, function (err, myresults) {
    if (err) throw err;
    if (userEmail == "" || userEmail == undefined) {
      res.render(__dirname + '/curtain', {
        results: myresults
      });
    }
    else {
      res.render(__dirname + '/afterSignInCurtain', {
        results: myresults
      });
    }
  });
});
app.get('/bsmall', function (req, res) {
  var userEmail = req.cookies.email
  let sql = `SELECT productid,c.categoryname, pt.producttypename,sm.sizename,productimgurl,price,brand,isnewarrival FROM homedecor.products as p inner join homedecor.category as c on c.categoryid=p.categoryid
  inner join homedecor.producttype as pt on pt.producttypeid=p.producttypeid
  inner join homedecor.sizemaster as sm on sm.sizeid=p.sizeid where producttypename="bedsheet" AND sizename="Small"`;
  let query = conn.query(sql, function (err, myresults) {
    if (err) throw err;
    if (userEmail == "" || userEmail == undefined) {
      res.render(__dirname + '/curtain', {
        results: myresults
      });
    }
    else {
      res.render(__dirname + '/afterSignInCurtain', {
        results: myresults
      });
    }
  });
});
app.get('/curtains', function (req, res) {
  var userEmail = req.cookies.email
  let sql = `SELECT productid,c.categoryname, pt.producttypename,sm.sizename,productimgurl,price,brand,isnewarrival FROM homedecor.products as p inner join homedecor.category as c on c.categoryid=p.categoryid
  inner join homedecor.producttype as pt on pt.producttypeid=p.producttypeid
  inner join homedecor.sizemaster as sm on sm.sizeid=p.sizeid where producttypename="curtain"`;
  let query = conn.query(sql, function (err, myresults) {
    if (err) throw err;
    if (userEmail == "" || userEmail == undefined) {
      res.render(__dirname + '/curtain', {
        results: myresults
      });
    }
    else {
      res.render(__dirname + '/afterSignInCurtain', {
        results: myresults
      });
    }
  });
});
app.get('/ddouble', function (req, res) {
  var userEmail = req.cookies.email
  let sql = `SELECT productid,c.categoryname, pt.producttypename,sm.sizename,productimgurl,price,brand,isnewarrival FROM homedecor.products as p inner join homedecor.category as c on c.categoryid=p.categoryid
  inner join homedecor.producttype as pt on pt.producttypeid=p.producttypeid
  inner join homedecor.sizemaster as sm on sm.sizeid=p.sizeid where producttypename="duver" AND sizename="Double"`;
  let query = conn.query(sql, function (err, myresults) {
    if (err) throw err;
    if (userEmail == "" || userEmail == undefined) {
      res.render(__dirname + '/curtain', {
        results: myresults
      });
    }
    else {
      res.render(__dirname + '/afterSignInCurtain', {
        results: myresults
      });
    }
  });
});
app.get('/dsmall', function (req, res) {
  var userEmail = req.cookies.email
  console.log("userEmail dsamll", userEmail);
  let sql = `SELECT productid,c.categoryname, pt.producttypename,sm.sizename,productimgurl,price,brand,isnewarrival FROM homedecor.products as p inner join homedecor.category as c on c.categoryid=p.categoryid
  inner join homedecor.producttype as pt on pt.producttypeid=p.producttypeid
  inner join homedecor.sizemaster as sm on sm.sizeid=p.sizeid where producttypename="duver" AND sizename="Small"`;
  let query = conn.query(sql, function (err, myresults) {
    if (err) throw err;
    if (userEmail == "" || userEmail == undefined) {
      res.render(__dirname + '/curtain', {
        results: myresults
      });
    }
    else {
      res.render(__dirname + '/afterSignInCurtain', {
        results: myresults
      });
    }
  });
});
// app.get('/clock', function (req, res) {
//   var userEmail = req.cookies.email
//   let sql = `SELECT productid,c.categoryname, pt.producttypename,sm.sizename,productimgurl,price,brand,isnewarrival FROM homedecor.products as p inner join homedecor.category as c on c.categoryid=p.categoryid
//   inner join homedecor.producttype as pt on pt.producttypeid=p.producttypeid
//   inner join homedecor.sizemaster as sm on sm.sizeid=p.sizeid where producttypename="Clock" AND sizename="Small"`;
//   let query = conn.query(sql, function (err, myresults) {
//     if (err) throw err;
//     if (userEmail == "" || userEmail == undefined) {
//       res.render(__dirname + '/curtain', {
//         results: myresults
//       });
//     }
//     else {
//       res.render(__dirname + '/afterSignInCurtain', {
//         results: myresults
//       });
//     }
//   });
// });
app.get('/clock', function (req, res) {
  var userEmail = req.cookies.email
  let sql = `SELECT productid,c.categoryname, pt.producttypename,sm.sizename,productimgurl,price,brand,isnewarrival FROM homedecor.products as p inner join homedecor.category as c on c.categoryid=p.categoryid
  inner join homedecor.producttype as pt on pt.producttypeid=p.producttypeid
  inner join homedecor.sizemaster as sm on sm.sizeid=p.sizeid where producttypename="Clock" AND (sizename="Small" OR sizename="Double")`;
  let query = conn.query(sql, function (err, myresults) {
    if (err) throw err;
    if (userEmail == "" || userEmail == undefined) {
      res.render(__dirname + '/curtain', {
        results: myresults
      });
    }
    else {
      res.render(__dirname + '/afterSignInCurtain', {
        results: myresults
      });
    }
  });
});
app.get('/mirrors', function (req, res) {
  var userEmail = req.cookies.email
  let sql = `SELECT productid,c.categoryname, pt.producttypename,sm.sizename,productimgurl,price,brand,isnewarrival FROM homedecor.products as p inner join homedecor.category as c on c.categoryid=p.categoryid
  inner join homedecor.producttype as pt on pt.producttypeid=p.producttypeid
  inner join homedecor.sizemaster as sm on sm.sizeid=p.sizeid where producttypename="Mirrors" AND (sizename="Small" OR sizename="Double")`;
  let query = conn.query(sql, function (err, myresults) {
    if (err) throw err;
    if (userEmail == "" || userEmail == undefined) {
      res.render(__dirname + '/curtain', {
        results: myresults
      });
    }
    else {
      res.render(__dirname + '/afterSignInCurtain', {
        results: myresults
      });
    }
  });
});
app.get('/candles', function (req, res) {
  var userEmail = req.cookies.email
  let sql = `SELECT productid,c.categoryname, pt.producttypename,sm.sizename,productimgurl,price,brand,isnewarrival FROM homedecor.products as p inner join homedecor.category as c on c.categoryid=p.categoryid
  inner join homedecor.producttype as pt on pt.producttypeid=p.producttypeid
  inner join homedecor.sizemaster as sm on sm.sizeid=p.sizeid where producttypename="Candles" AND (sizename="Small" OR sizename="Double")`;
  let query = conn.query(sql, function (err, myresults) {
    if (err) throw err;
    if (userEmail == "" || userEmail == undefined) {
      res.render(__dirname + '/curtain', {
        results: myresults
      });
    }
    else {
      res.render(__dirname + '/afterSignInCurtain', {
        results: myresults
      });
    }
  });
});
// app.get('/ddouble', function (req, res) {
//   res.render(__dirname + "/duvetdouble");
// });


app.get('/btnsignout', function (req, res) {
  res.render(__dirname + "/homapage1");
});

app.get('/signInHeader', function (req, res) {
  var userEmail = req.cookies.email
  console.log("userEmail........", userEmail);
  console.log("result", userEmail)
  res.render(__dirname + '/signInHeader', {
    results: userEmail
  });
});

app.get('/clocks', function (req, res) {
  res.render(__dirname + "/clocks");
});

app.get('/btnsignin', function (req, res) {
  let email = req.query.txtemail;
  let pass = req.query.txtpass;
  let sql = "SELECT * FROM users WHERE email='" + email + "' and password='" + pass + "' and userType='user'";
  // let sql = `SELECT * FROM users WHERE email='" + email + "' and password='" + pass + "'`;
  let query = conn.query(sql, function (err, myresults) {
    if (err) throw err;
    console.log(myresults.length);
    if (myresults.length != 0) {
      console.log("in panel if")
      res.cookie('email', email);
      res.cookie('password', pass);
      let sql = `SELECT productid,c.categoryname, pt.producttypename,sm.sizename,productimgurl,price,brand,isnewarrival FROM homedecor.products as p inner join homedecor.category as c on c.categoryid=p.categoryid
      inner join homedecor.producttype as pt on pt.producttypeid=p.producttypeid
      inner join homedecor.sizemaster as sm on sm.sizeid=p.sizeid`;
      let query = conn.query(sql, function (err, myresults) {
        if (err) throw err;
        res.render(__dirname + '/afterSignIn', {
          results: myresults
        });
      });
    }
    else {
      console.log("in panel else")
      res.render(__dirname + "/homepage1");
    }
  });
});

app.get('/changePassword', function (req, res) {
  let email = req.query.txtemail;
  let pass = req.query.txtpass;
  // let sql = "SELECT * FROM users WHERE email='" + email + "' and password='" + pass + "'";
  let sql = `Update users set password = '${pass}' where email='${email}'`;
  let query = conn.query(sql, function (err, myresults) {
    if (err) throw err;
    console.log(myresults.length);
    res.redirect("home");
  });
});
// add to cart old 
// app.post("/addTocart", function (req, res, next) {
//   console.log("req.body######## ", req.cookies.email);
//   var userEmail = req.cookies.email
//   let sql = `INSERT INTO cart SET productId = ${req.body.productId}, price = ${req.body.productCost}, isOrderd=false, userEmail='${userEmail}, status="pending"'`;
//   let query = conn.query(sql, function (err, myresults) {
//     if (err) throw err;
//     else {
//       res.send("Success add in cart");
//     }

//   });
// })
app.post("/addTocart", function (req, res, next) {
  console.log("req.body######## ", req.cookies.email);
  var userEmail = req.cookies.email
  // let data = { productId: req.body.productId, price: req.body.productCost, isOrderd: false };
  let sql = `INSERT INTO cart SET productId = ${req.body.productId}, price = ${req.body.productCost}, isOrderd=false, userEmail='${userEmail}', status="pending"`;
  let query = conn.query(sql, function (err, myresults) {
    if (err) throw err;
    else {
      res.send("Success add in cart");
    }
    //     let sql = `SELECT productid,c.categoryname, pt.producttypename,sm.sizename,productimgurl,price,brand,isnewarrival FROM homedecor.products as p inner join homedecor.category as c on c.categoryid=p.categoryid
    // inner join homedecor.producttype as pt on pt.producttypeid=p.producttypeid
    // inner join homedecor.sizemaster as sm on sm.sizeid=p.sizeid`;
    //     let query = conn.query(sql, function (err, myresults) {
    //       if (err) throw err;
    //       res.render(__dirname + '/viewproduct.ejs', {
    //         results: myresults
    // });
    // });
    // res.send("Success, Image uploaded!" + req.body.producttype);
  });
})
// add to cart old END
app.get("/viewCart", function (req, res, next) {
  console.log("req.body######## ", req.cookies.email);
  var userEmail = req.cookies.email
  // let data = { productId: req.body.productId, price: req.body.productCost, isOrderd: false };
  let sql = `select c.id as cartId, p.productid as productId, pt.producttypename, sum(c.price) as ptotal, p.brand, c.price, c.userEmail, count(c.productId) as Quantity from homedecor.cart as c inner join homedecor.products as p on p.productid = c.productid 
  inner join homedecor.producttype as pt on pt.producttypeid=p.producttypeid
  where isOrderd=false 
  And userEmail="${userEmail}"
   group by c.productId`;
  let query = conn.query(sql, function (err, myresults) {
    let query = conn.query(sql, function (err, myresults) {
      if (err) throw err;
      res.render(__dirname + '/cart', {
        results: myresults
      });
    });
  })
})

app.get("/subtotalCartItem", function (req, res, next) {
  console.log("req.body######## ", req.cookies.email);
  var userEmail = req.cookies.email
  let sql = `select sum(price) as subTotal from cart where isOrderd=false And userEmail="${userEmail}"`;
  let query = conn.query(sql, function (err, myresults) {
    let query = conn.query(sql, function (err, myresults) {
      if (err) throw err;
      res.send(myresults);
    });
  })
})

app.get("/cartItemIds", function (req, res, next) {
  console.log("req.body######## ", req.cookies.email);
  var userEmail = req.cookies.email
  let sql = `select id from cart where isOrderd=false And userEmail="${userEmail}"`;
  let query = conn.query(sql, function (err, myresults) {
    let query = conn.query(sql, function (err, myresults) {
      if (err) throw err;
      console.log("myresults", myresults)
      res.send(myresults);
    });
  })
})

app.get("/viewCheckout", function (req, res, next) {
  console.log("req.body######## ", req.cookies.email);
  var userEmail = req.cookies.email
  // let data = { productId: req.body.productId, price: req.body.productCost, isOrderd: false };
  let sql = `select c.id as cartId, p.productid as productId, pt.producttypename, sum(c.price) as ptotal, p.brand, c.price, c.userEmail, count(c.productId) as Quantity from homedecor.cart as c inner join homedecor.products as p on p.productid = c.productid 
  inner join homedecor.producttype as pt on pt.producttypeid=p.producttypeid
  where isOrderd=false 
  And userEmail="${userEmail}"
   group by c.productId`;
  let query = conn.query(sql, function (err, myresults) {
    let query = conn.query(sql, function (err, myresults) {
      if (err) throw err;
      res.render(__dirname + '/checkout', {
        results: myresults
      });
    });
  })
})

app.post("/cartItemRemovee", function (req, res) {
  console.log("cartItemRemovereq.body@@@@@@@@######## ", req.body.cartId);
  var userEmail = req.cookies.email

  let sql = `DELETE FROM cart Where id=${req.body.cartId}`
  let query = conn.query(sql, function (err, myresults) {
    if (err) throw err;
    else {
      // res.send("Success add in cart");
      res.redirect("viewCheckout");
    }
  });
})


app.post("/paymentGetway1", async function (req, res) {
  // #home123456
  let CashFree_AppId = "970956cd6c9acc6fdece248c159079";
  let CashFree_SecretKey = "823f101db442b76280e84840466dc5865b1a342c";
  console.log("paymentGetway.body req.body.price@@@@@@@@######## ", req.body);
  for (let i = 0; i < req.body.cIdLength; i++) {
    console.log("eleId........ ", req.body.cartId[0])
    // sql = `update cart set isOrderd = true where id = ${ele.id} `;
  }
  var userEmail = req.cookies.email
  let orderId = Math.floor(100000 + Math.random() * 9000000);
  //////////////////////////////////////////////////////////////////////////
  let secretKey = process.env.CashFree_SecretKey;
  let postData = {
    appId: CashFree_AppId,
    secretKey: CashFree_SecretKey,
    orderId: orderId,
    orderAmount: req.body.price,
    orderCurrency: 'INR',
    orderNote: 'item price payment',
    customerEmail: userEmail,
    customerName: "Chanchal",
    customerPhone: "97453657999",
    returnUrl: 'http://localhost:3000/placedorder',
  }
  let url = 'https://test.cashfree.com/api/v1/order/create'
  await axios.post(url, qs.stringify(postData), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).then(async (result) => {
    console.log("then result is############################################ ", result.data)
    console.log(result.data.paymentLink)

    console.log("eleId........ ", req.body.cartId)
    // let CIDS = req.body.cartId
    // for(let i =0; i< req.body.cIdLength; i++){
    //   console.log("eleId........ ", req.body.cartId[i])
    //   // sql = `update cart set isOrderd = true where id = ${ele.id} `;
    // }

    // res.redirect(result.data.paymentLink)
    // res.send(result.data.paymentLink)
  }).catch((err) => {
    console.log("catch err is ", err);
    let paymentLink = err.response.data
    console.log("paymentLink", paymentLink);
  });
})

app.post("/paymentGetway", async function (req, res) {
  // #home123456
  let CashFree_AppId = "970956cd6c9acc6fdece248c159079";
  let CashFree_SecretKey = "823f101db442b76280e84840466dc5865b1a342c";
  console.log("paymentGetway.body req.body.price@@@@@@@@######## ", req.body);


  var userEmail = req.cookies.email
  sql = `update cart set isOrderd = true where id = ${req.body.cartId} And userEmail = '${userEmail}'`;
  let query = conn.query(sql, function (err, myresults) {
    if (err) throw err;
  });

  let orderId = Math.floor(100000 + Math.random() * 9000000);
  //////////////////////////////////////////////////////////////////////////
  let secretKey = process.env.CashFree_SecretKey;
  let postData = {
    appId: CashFree_AppId,
    secretKey: CashFree_SecretKey,
    orderId: orderId,
    orderAmount: req.body.price,
    orderCurrency: 'INR',
    orderNote: 'item price payment',
    customerEmail: userEmail,
    customerName: "Chanchal",
    customerPhone: "97453657999",
    returnUrl: 'http://theluxehomehub.com/thankyou/',
  }
  let url = 'https://test.cashfree.com/api/v1/order/create'
  await axios.post(url, qs.stringify(postData), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).then(async (result) => {
    console.log("then result is############################################ ", result.data)
    console.log(result.data.paymentLink)

    console.log("eleId........ ", req.body.cartId)

    // res.redirect(result.data.paymentLink)
    res.send(result.data.paymentLink)
  }).catch((err) => {
    console.log("catch err is ", err);
    let paymentLink = err.response.data
    console.log("paymentLink", paymentLink);
  });
})

app.post('/btnregsubmit', function (req, res) {
  let data = { firstname: req.body.txtfn, lastname: req.body.txtln, mobileno: req.body.txtmn, email: req.body.txtemail, password: req.body.txtpass, userType: 'user' };
  let sql = "INSERT INTO users SET ?";
  let query = conn.query(sql, data, function (err, results) {
    if (err) {
      res.send("User with " + req.body.txtemail + " email it already registed");
      // throw err;
    } else {
      // registerMsg
      res.render(__dirname + '/registerMsg', {
        results: "You successfullt registered"
      });
      // res.render(__dirname + "/reg");
    }
  });
});


app.get('/btnforgotpass', function (req, res) {
  email = req.query.txtemail;
  pass = req.query.txtnewpass;

  let sql = "UPDATE users SET password='" + pass + "' WHERE email='" + email + "'";
  let query = conn.query(sql, function (err, myresults) {
    if (err) throw err;
    res.render(__dirname + "/homepage1");
  });
});



//admin section start from here.

app.get('/admin', function (req, res) {
  res.render(__dirname + "/adminLogin");
  // res.render(__dirname + "/homepage");
});

app.post('/btnAdminregsubmit', function (req, res) {
  let data = { firstname: req.body.txtfn, lastname: req.body.txtln, mobileno: req.body.txtmn, email: req.body.txtemail, password: req.body.txtpass, userType: 'admin' };
  let sql = "INSERT INTO users SET ?";
  let query = conn.query(sql, data, function (err, results) {
    if (err) {
      res.send("User with " + req.body.txtemail + " email it already registed");
      // throw err;
    } else {
      // registerMsg
      res.render(__dirname + '/adminRegisterMsg', {
        results: "You successfullt registered"
      });
      // res.render(__dirname + "/reg");
    }
  });
});
app.get('/btnAdminsignin', function (req, res) {
  let email = req.query.txtemail;
  let pass = req.query.txtpass;
  let sql = "SELECT * FROM users WHERE email='" + email + "' and password='" + pass + "' and userType='admin'";
  // let sql = `SELECT * FROM users WHERE email='" + email + "' and password='" + pass + "'`;
  let query = conn.query(sql, function (err, myresults) {
    if (err) throw err;
    console.log(myresults.length);
    if (myresults.length != 0) {
      console.log("in panel if")
      res.cookie('email', email);
      res.cookie('password', pass);
      let sql = `SELECT productid,c.categoryname, pt.producttypename,sm.sizename,productimgurl,price,brand,isnewarrival FROM homedecor.products as p inner join homedecor.category as c on c.categoryid=p.categoryid
      inner join homedecor.producttype as pt on pt.producttypeid=p.producttypeid
      inner join homedecor.sizemaster as sm on sm.sizeid=p.sizeid`;
      let query = conn.query(sql, function (err, myresults) {
        if (err) throw err;
        res.render(__dirname + '/homepage', {
          results: myresults
        });
      });
    }
    else {
      console.log("in panel else")
      res.send("Invalid email password");
    }
  });
});
app.get('/addproduct', function (req, res) {
  let sql = "SELECT * FROM producttype";
  let query = conn.query(sql, function (err, myresults) {
    if (err) throw err;
    res.render(__dirname + '/addproduct', {
      results: myresults
    });
  });
});


app.get('/addproducttype', function (req, res) {
  res.render(__dirname + "/addproducttype");
});

app.post('/editproduct', function (req, res, next) {
  console.log("req.query.pid", req.query);
  var param = [req.query,
  req.query.pid]

  // let sql="UPDATE users SET ? WHERE pid=?";
  // let query = conn.query(sql,param,function(err, myresults)  {
  //   if(err) throw err;
  //   res.redirect("viewproduct");
  //   });
  upload(req, res, function (err) {

    if (err) {
      res.send(err)
    }
    else {
      console.log("req.query.pid", req.body);
      sql = `update products set categoryid = ${req.body.category},producttypeid=${req.body.producttype}, price=${req.body.price},brand='${req.body.company}', sizeid=${req.body.size} , productimgurl = '${imgurl}' where productid = ${req.query.pid} `;
      let query = conn.query(sql, function (err, myresults) {
        if (err) throw err;

        // res.send("Success, updated!" + req.body.producttype);
        res.redirect("viewproduct");
      });
    }
  })
});


app.get('/updateproduct', function (req, res) {
  console.log(req.url.split("?pid=")[1])
  var PIDNO = req.url.split("?pid=")[1];
  let sql = "SELECT * FROM producttype";
  let query = conn.query(sql, function (err, myresults) {
    if (err) throw err;
    res.render(__dirname + '/updateproduct', {
      results: myresults,
      Pid: PIDNO
    });
  });
  // res.render(__dirname + '/updateproduct.ejs');
});

app.get('/submitproducttype', function (req, res) {
  let data = { producttypename: req.query.producttypename, categoryid: req.query.category, sizeid: req.query.size };
  let sql = "INSERT INTO producttype SET ?";
  let query = conn.query(sql, data, function (err, results) {
    if (err) throw err;
    res.redirect("viewproducttype");
  });
});

app.get('/viewproducttype', function (req, res) {
  let sql = "SELECT * FROM producttype ";
  let query = conn.query(sql, function (err, myresults) {
    if (err) throw err;
    res.render(__dirname + '/viewproducttype', {
      results: myresults
    });
  });
});


app.get('/updateproducttype', function (req, res) {
  producttypeid = req.query.producttypeid;

  let sql = "SELECT * FROM producttype WHERE producttypeid=" + producttypeid;
  let query = conn.query(sql, function (err, myresults) {
    if (err) throw err;
    res.render(__dirname + '/updateproducttype.ejs', {
      results: myresults[0]
    });
  });
});

app.post('/editproducttype', function (req, res) {

  var param = [req.body.producttype, req.body.category, req.body.size, req.body.producttypeid]

  console.log(param);
  let sql = "UPDATE producttype SET producttypename=?, categoryid=?, sizeid=? WHERE producttypeid=?";
  let query = conn.query(sql, param, function (err, myresults) {
    if (err) throw err;

    res.redirect("viewproducttype");

  });
});

app.get('/orderdetails', function (req, res) {
  orderid = req.query.orderid;
console.log("req.query.orderid",req.query.orderid)
  let sql = `select c.id as cartId, c.status as status, p.productimgurl as pImg, p.productid as productId, pt.producttypename, sum(c.price) as ptotal, p.brand, c.price, c.userEmail, count(c.productId) as Quantity from homedecor.cart as c inner join homedecor.products as p on p.productid = c.productid 
  inner join homedecor.producttype as pt on pt.producttypeid=p.producttypeid
  where p.productId=${orderid} group by c.productId`;
  let query = conn.query(sql, function (err, myresults) {
    if (err) throw err;

    res.render(__dirname + '/orderdetails.ejs', {
      results: myresults
    });
  });
});

app.get('/orderdetails1', function (req, res) {
  res.render(__dirname + '/orderdetails1.ejs');
});

app.get('/orderdetails2', function (req, res) {
  res.render(__dirname + '/orderdetails2.ejs');
});

/*app.post('/submitproduct',function(req, res) {
  let data = {pid: req.body.productid, bid: req.body.brandid, pname: req.body.productname, imgurl: req.body.imgurl, discription: req.body.discription, rate: req.body.rate};
  let sql = "INSERT INTO product SET ?";
  let query = conn.query(sql, data,function(err, results){
    if(err) throw err;
    res.redirect("viewproduct");
  });
});*/

app.get('/viewproduct', function (req, res) {
  let sql = `SELECT productid,c.categoryname, pt.producttypename,sm.sizename,productimgurl,price,brand,isnewarrival FROM homedecor.products as p inner join homedecor.category as c on c.categoryid=p.categoryid
  inner join homedecor.producttype as pt on pt.producttypeid=p.producttypeid
  inner join homedecor.sizemaster as sm on sm.sizeid=p.sizeid`;
  let query = conn.query(sql, function (err, myresults) {
    if (err) throw err;
    res.render(__dirname + '/viewproduct.ejs', {
      results: myresults

    });
    // console.log("product result ", myresults);
  });
});

app.get('/viewcustomer', function (req, res) {
  let sql = "SELECT * FROM users where userType='user'";
  let query = conn.query(sql, function (err, myresults) {
    if (err) throw err;
    res.render(__dirname + '/viewcustomer.ejs', {
      results: myresults
    });
  });
});


app.get('/vieworder', function (req, res) {
  var userEmail = req.cookies.email
  // let data = { productId: req.body.productId, price: req.body.productCost, isOrderd: false };
  let sql = `select c.id as cartId, c.status as status, p.productimgurl as pImg, p.productid as productId, pt.producttypename, sum(c.price) as ptotal, p.brand, c.price, c.userEmail, count(c.productId) as Quantity from homedecor.cart as c inner join homedecor.products as p on p.productid = c.productid 
  inner join homedecor.producttype as pt on pt.producttypeid=p.producttypeid
  where isOrderd=true group by c.productId`;
  let query = conn.query(sql, function (err, myresults) {
    let query = conn.query(sql, function (err, myresults) {
      if (err) throw err;
      res.render(__dirname + '/vieworder', {
        results: myresults
      });
    });
  });
});


app.get('/deleteproduct', function (req, res) {

  console.log("req.query.pid", req.query.pid);
  pid = req.query.pid;
  console.log(pid)
  let sql = "DELETE from products where productid=" + pid;
  let query = conn.query(sql, function (err, myresults) {
    if (err) {
      res.jsonp("Parent row cannot delete or update")
      throw err
    }
    else {
      let sql = `SELECT productid,c.categoryname, pt.producttypename,sm.sizename,productimgurl,price,brand,isnewarrival FROM homedecor.products as p inner join homedecor.category as c on c.categoryid=p.categoryid
  inner join homedecor.producttype as pt on pt.producttypeid=p.producttypeid
  inner join homedecor.sizemaster as sm on sm.sizeid=p.sizeid`;
      let query = conn.query(sql, function (err, myresults) {
        if (err) throw err;
        res.render(__dirname + '/viewproduct.ejs', {
          results: myresults

        });
        // console.log("product result ", myresults);
      });
    }
  });
});
app.get('/deleteproducttype', function (req, res) {

  console.log("req.query.pid", req.query.producttypeid);
  try {
    let sql = "DELETE from producttype where producttypeid=" + req.query.producttypeid;
    let query = conn.query(sql, function (err, myresults) {
      if (err) {
        res.json("Parent row cannot delete or update")
        throw err
      }
      else {
        res.redirect("viewproducttype");
      }
    });
  } catch (err) {
    console.log(err);
  }

});

app.post('/cartStatusChange', function (req, res) {
  var userEmail = req.cookies.email
  // let data = { productId: req.body.productId, price: req.body.productCost, isOrderd: false };
  sql = `update cart set status = '${req.body.cstatus}' where id = ${req.body.cartId}`;
  let query = conn.query(sql, function (err, myresults) {
    let query = conn.query(sql, function (err, myresults) {
      if (err) throw err;
      res.send('success')
    });
  });
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});