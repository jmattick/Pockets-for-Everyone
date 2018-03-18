var express = require("express");
var router = express.Router({mergeParams:true});
var Vendor = require("../models/vendor");
var Comment = require("../models/comment");
var middleware = require("../middleware");
//Comments New
router.get("/new", middleware.isLoggedIn, function(req, res){
    Vendor.findById(req.params.id, function(err, vendor){
        if (err){
            console.log(err);
        } else {
            res.render("comments/new", {vendor: vendor});
        }
    });
});

//Comments Create
router.post("/", middleware.isLoggedIn, function(req, res){
   Vendor.findById(req.params.id, function(err, vendor){
       if (err){
           console.log(err);
           res.redirect("/vendors");
       } else {
          Comment.create(
              req.body.comment, function(err, comment){
                  if (err){
                      req.flash("error", "Something went wrong");
                      console.log(err);
                  } else {
                      //add username and id to comment
                      comment.author.id = req.user._id;
                      comment.author.username = req.user.username;
                      comment.reportedCount = 0;
                      //save comment
                      comment.save();
                      req.flash("success", "Successfully added comment");
                      vendor.comments.push(comment._id);//changed from ._id and back
                      vendor.save();
                      res.redirect("/vendors/"+vendor._id);
                  }
              }
          );
       }
   }) ;
});

//EDIT COMMENT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
   Vendor.findById(req.params.id, function(err, foundVendor){
       if(err || !foundVendor) {
           req.flash("error", "No vendor found");
           return res.redirect("back");
       }
       Comment.findById(req.params.comment_id, function(err, foundComment){
       
       
           if(err || !foundComment){
               
               res.redirect("back");
           } else {
               
                res.render("comments/edit",{vendorid: req.params.id, comment: foundComment});
           }
       });
   });
   
   
});

//UPDATE Comment Route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
       if (err){
           res.redirect("back");
       } else {
           res.redirect("/vendors/"+req.params.id);
       }
    });
}); 

//DESTROY Comment Route
router.delete("/:comment_id",middleware.checkCommentOwnership ,function(req, res){
   Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect("back");
       } else {
           req.flash("success", "Comment deleted");
           res.redirect("/vendors/"+req.params.id);
       }
   })
});

//get comment report form
router.get("/:comment_id/report", middleware.isLoggedIn, function(req, res){
   Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err || !foundComment){
            req.flash("error", "Something went wrong");
            res.redirect("back");
        } else {
              res.render("comments/report", {comment: foundComment, user: req.user, vendorId: req.params.id});
        }
    });
});

//report comment
router.put("/:comment_id/report", middleware.isLoggedIn, function(req, res){
    var newData = {
        $push: {reportedBy: req.body.comment.reportedBy}, 
        $set: {reportedCount: req.body.comment.reportedCount}
        
    };
    Vendor.findByIdAndUpdate(req.params.id, {reportedComment: true}, function(err, updatedVendor){
       if(err){
           res.redirect("/vendors/"+req.params.id);
       } 
    });
        Comment.findByIdAndUpdate(req.params.comment_id, newData, function(err, updatedComment){
       if(err){
            res.redirect("/vendors/"+req.params.id);
       } else {
           res.redirect("/vendors/"+req.params.id);
       }
    });
    
});

//approve comment
router.put("/:comment_id/approve", middleware.isLoggedIn, function(req, res){
    var newData = {
        $set: {approved: true}
        
    };
        Comment.findByIdAndUpdate(req.params.comment_id, newData, function(err, updatedContent){
       if(err){
            res.redirect("/vendors/"+req.params.id);
       } else {
           res.redirect("/vendors/"+req.params.id);
       }
    });
    
});


module.exports = router;