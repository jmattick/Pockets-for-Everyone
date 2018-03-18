var express = require("express");
var router = express.Router({mergeParams:true});
var Vendor = require("../models/vendor");
var Comment = require("../models/comment");
var Message = require("../models/message");
var middleware = require("../middleware");

//get new message form
router.get("/message/new", middleware.isLoggedIn, function(req, res){
    Vendor.findById(req.params.id, function(err, message){
        if (err){
            console.log(err);
        } else {
            res.render("messages/new", {message: message});
        }
    });
    
});

//create message
router.post("/message/new", middleware.isLoggedIn, function(req, res){
  
          Message.create(
              req.body.message, function(err, message){
                  if (err){
                      req.flash("error", "Something went wrong");
                      console.log(err);
                  } else {
                      //add username and id to comment
                      message.author.id = req.user._id;
                      message.author.username = req.user.username;
                      message.resolved = false;
                      //save comment
                      message.save();
                      req.flash("success", "Successfully sent message");
                      
                      res.redirect("/vendors");
                  }
              } 
          );
       
});




//show messages page
router.get("/message", middleware.isAdmin, function(req, res){
   Message.find({}, function(err, message){
       if(err){
           console.log(err);
       } else {
           res.render("messages/show", {message: message, messageid: message._id});
       }
   });
});

//show unresolved messages

router.get("/message/unresolved", middleware.isAdmin, function(req, res){
   Message.find({resolved: false}, function(err, message){
       if(err){
           console.log(err);
       } else {
           res.render("messages/show", {message: message});
       }
   });
});

//show single message
router.get("/message/:message_id", middleware.isAdmin, function(req, res){
    Message.findById(req.params.message_id, function(err, message){
        if(err){
            console.log(err);
        } else {
            res.render("messages/view", {message: message})
        }
    });
});

//edit status of message
   
router.put("/message/:message_id", middleware.isAdmin, function(req, res){
    Message.findByIdAndUpdate(req.params.message_id, { $set: { resolved: true }}, function(err, updatedMessage){
       if (err){
           res.redirect("back");
       } else {
           res.redirect("/message/"+req.params.message_id);
       }
    });
}); 
    




module.exports = router;