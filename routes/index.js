var express = require("express");
var router = express.Router();
var middleware = require("../middleware");
var passport = require("passport");
var User = require("../models/user");
var Vendor = require("../models/vendor");
// var async = require("async");
// var nodemailer = require("nodemailer");
// var crypto = require("crypto");
var https = require('https');
//Root Route
router.get("/", function(req, res){
    res.render("landing");
});

//show register form
router.get("/register", function(req, res){
    res.render("register", {page: 'register'});
});

//handle sign up logic
router.post("/register", middleware.usernameToLowerCase, function(req, res){
    //
    ///
    ///
    ////////New 
             verifyRecaptcha(req.body["g-recaptcha-response"], function(success) {
                if (success) {
                    var newUser = new User({username: req.body.username, email: req.body.email});
                //      if(req.body.adminCode === 'secretcode123') {
                //       newUser.isAdmin = true;
                // }
                   User.register(newUser, req.body.password, function(err, user){
                       if (err){
                          req.flash("error", err.message);
                          return  res.redirect("/register");
                       }
                       passport.authenticate("local")(req, res, function(){
                           req.flash("success", "Welcome to Pockets "+ user.username);
                           res.redirect("/vendors");
                       });
                   } ); 
                    
                } else {
                        req.flash("error", "Something went wrong.");
                        return res.redirect("/");
                }
});

    ////////endnew
    //
    //
    
});

//show login form
router.get("/login", function(req, res){
    res.render("login", {page:'login'});
});
//handle login logic
router.post("/login", middleware.usernameToLowerCase, passport.authenticate("local", {
    successRedirect: "/vendors",
    failureRedirect: "/login"
}),function(req, res){
    
});
//logout route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/vendors");
});



// USER PROFILE
router.get("/users/:id", function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    if(err) {
      req.flash("error", "Something went wrong.");
      return res.redirect("/");
    }
    Vendor.find().where('author.id').equals(foundUser._id).exec(function(err, vendors) {
      if(err) {
        req.flash("error", "Something went wrong.");
        return res.redirect("/");
      }
      res.render("users/show", {user: foundUser, vendors: vendors});
    })
  });
});

//About Page
router.get("/about", function(req, res){
   res.render("about"); 
});

//admin page
router.get("/adminpage", middleware.isAdmin,  function(req, res){
      Vendor.find({
          $or: [
              {$and: [
              {reportedCount: {$gt: 0}},
              {approved: {$ne: true}}
              ]},
              {reportedComment: true}
              ]
          
      }, function(err, vendors){
          if(err){
              req.flash("error", "Something went wrong");
              return res.redirect("/vendors");
          }
          res.render("adminpage", {vendors: vendors});
          
          
          
      });
});

//new stuff below
var SECRET = process.env.RECAPSECRET;

// Helper function to make API call to recatpcha and check response
function verifyRecaptcha(key, callback) {
        https.get("https://www.google.com/recaptcha/api/siteverify?secret=" + SECRET + "&response=" + key, function(res) {
                var data = "";
                res.on('data', function (chunk) {
                        data += chunk.toString();
                });
                res.on('end', function() {
                        try {
                                var parsedData = JSON.parse(data);
                                callback(parsedData.success);
                        } catch (e) {
                                callback(false);
                        }
                });
        });
}


module.exports = router;