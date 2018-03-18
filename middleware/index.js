var middlewareObj={};
var Vendor = require("../models/vendor");
var Comment = require("../models/comment");

middlewareObj.checkVendorOwnership = function(req, res, next){
    
   
     if(req.isAuthenticated()){
         Vendor.findById(req.params.id).populate("comments").exec(function(err, foundVendor){
        if(err || !foundVendor){
            req.flash("error", "Vendor not found");
            res.redirect("back");
        } else {
            if(foundVendor.author.id.equals(req.user._id) || req.user.isAdmin){
                next();
            } else {
                req.flash("error", "You don't have permission to do that");
                res.redirect("back");
                
            }
              
        }
    });
        
    }   else {
       req.flash("error", "You need to be logged in");
        res.redirect("back");
    }              

    
};

middlewareObj.checkCommentOwnership = function(req, res, next){
      if(req.isAuthenticated()){
         Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err || !foundComment){
            req.res("error", "Comment not found");
            res.redirect("back");
        } else {
            if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                next();
            } else {
                req.flash("error", " You don't have permission to do that");
                res.redirect("back");
            }
              
        }
    });
        
    }   else {
        req.flash("error", "You need to be logged in");
        res.redirect("back");
    }              
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } 
    req.flash("error", "You need to be logged in");
    res.redirect("/login");
};

middlewareObj.isAdmin = function(req, res, next){
    if(req.isAuthenticated()&& req.user.isAdmin){
        return next();
    } 
    req.flash("error", "You shall not pass!");
    res.redirect("/vendors");
};



middlewareObj.isSafe = function(req, res, next) {
    if(req.body.vendor.image.match(/^https:\/\/images\.unsplash\.com\/.*/)) {
      next();
    }else {
      req.flash('error', 'Select an image to continue');
      res.redirect('back');
    }
};

middlewareObj.usernameToLowerCase = function(req, res, next){
    req.body.username = req.body.username.toLowerCase();
    next();
}

module.exports = middlewareObj;