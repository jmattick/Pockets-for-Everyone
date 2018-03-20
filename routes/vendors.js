var express = require("express");
var router = express.Router();

var Vendor = require("../models/vendor");
var middleware = require("../middleware");
var geocoder = require("geocoder");

//index -show all vendors
router.get("/", function(req, res){
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    var noMatch = null;
    
    if(req.isAuthenticated() && !req.user.isAdmin){
       //search  logged in
        if(req.query.search){
            const regex = new RegExp(escapeRegex(req.query.search), 'gi');
            Vendor.find({
                $and: [
                    {name: regex},
                    {reportedBy: {'$nin': [req.user._id]}},
                    {$or: [
                        { reportedCount: { $lt: 3 }}, 
                        {reportedCount: '' },
                        {approved: true}
                    ]}
                
                ]
            }).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allVendors) {
                if(err){
                    console.log(err);
                    res.redirect("back");
                }
            Vendor.count({name: regex}).exec(function(err, count){
          
                if (err){
                    console.log(err);
                    res.redirect("back");
                } else {
                    if(allVendors.length<0){
                        noMatch = "No vendors match that query, please try again";
                    }
                    res.render("vendors/index", {
                        vendors:allVendors, 
                        // page:"vendors"
                        current: pageNumber,
                        pages: Math.ceil(count/perPage),
                        noMatch: noMatch,
                        search: req.query.search
                    });
                }
            });    
            });
            
        } else {
        
        
       // Get all vendors logged in
       
        Vendor.find({
            $and: [
                    {reportedBy: {'$nin': [req.user._id]}},
                    {$or: [
                        { reportedCount: { $lt: 3 }}, 
                        {reportedCount: '' },
                        {approved: true}
                    ]}
                
                ]
            
            
        }).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allVendors) {
           if (err){
               console.log(err);
               res.redirect("back");
           }
            Vendor.count().exec(function(err, count){
      
            if (err){
                console.log(err);
            } else {
                res.render("vendors/index", {
                    vendors:allVendors, 
                    // page:"vendors",
                    current: pageNumber,
                    pages: Math.ceil(count/perPage),
                    noMatch: noMatch,
                    search: false
                    
                });
            }
        });
        });
        }
       //end logged in index
     //start admin is logged in index
    }else if(req.isAuthenticated() && req.user.isAdmin) {
       //search admin logged in
        if(req.query.search){
            const regex = new RegExp(escapeRegex(req.query.search), 'gi');
            Vendor.find({name: regex, reportedBy: {'$nin': [req.user._id]}}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allVendors) {
                if(err){
                    console.log(err);
                    res.redirect("back");
                }
            Vendor.count({name: regex}).exec(function(err, count){
          
                if (err){
                    console.log(err);
                } else {
                    res.render("vendors/index", {
                        vendors:allVendors, 
                        // page:"vendors"
                        current: pageNumber,
                        pages: Math.ceil(count/perPage),
                        noMatch: noMatch,
                        search: req.query.search
                        
                    });
                }
            });   
            });
            
        } else {
        
        
       // Get all vendors admin logged in
       
        Vendor.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allVendors) {
                if(err){
                    console.log(err);
                    res.redirect("back");
                }
            Vendor.count({}).exec(function(err, count){
      
            if (err){
                console.log(err);
            } else {
                res.render("vendors/index", {
                    vendors:allVendors, 
                    // page:"vendors"
                    current: pageNumber,
                    pages: Math.ceil(count/perPage),
                    noMatch: noMatch,
                    search: false
                });
            }
        });
        });
        }
  //end logged in admin     
    } else { 
        //search not logged in
         if(req.query.search){
            const regex = new RegExp(escapeRegex(req.query.search), 'gi');
            Vendor.find({
                $and: [
                    {name: regex},
                    {
                        $or: [
                            { reportedCount: { $lt: 3 }}, 
                            {reportedCount: '' },
                            {approved: true}
                ]
                    }
                    ]
                
                
            }).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allVendors) {
                if(err){
                    console.log(err);
                    res.redirect("back");
                }
            Vendor.count({name: regex}).exec(function(err, count){
          
                if (err){
                    console.log(err);
                } else {
                    res.render("vendors/index", {
                        vendors:allVendors, 
                        current: pageNumber,
                        pages: Math.ceil(count/perPage),
                        noMatch: noMatch,
                        search: req.query.search
                        });
                }
            });   
            });
            
        }else {
        
        
       // Get all vendors not logged in
       
        Vendor.find({
            $or: [
                { reportedCount: { $lt: 3 }}, 
                {reportedCount: '' },
                {approved: true}
                ]
            
        }).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allVendors) {
           if (err){
               console.log(err);
               res.redirect("back");
           }
            Vendor.count().exec(function(err, count){
      
            if (err){
                console.log(err);
            } else {
                res.render("vendors/index", {
                    vendors:allVendors, 
                    current: pageNumber,
                    pages: Math.ceil(count/perPage),
                    noMatch: noMatch,
                    search: false
                    
                });
            }
        });
        });
        }
    }
});
//Create- create new vendor
router.post("/", middleware.isLoggedIn, middleware.isSafe, function(req, res){
    
    var name = req.body.vendor.name;
    var price = req.body.vendor.price;
   var image = req.body.vendor.image;
   var p = req.body.vendor.p;
   var url = req.body.vendor.url;
   var dsc = req.body.vendor.description;
   var author = {
     id: req.user._id,
     username: req.user.username
   };
   geocoder.geocode(req.body.vendor.location, function (err, data) {
          if (err || !data.results[0]){
             req.flash("error", "Something went wrong. Please fill out all fields");
            res.redirect("back");
        } else {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
   
   var newVendor = {name:name, image:image, p: p, url: url, description:dsc, author: author, price: price, location: location, lat: lat, lng: lng, reportedCount: 0};
   //Create new and save to database
   Vendor.create(newVendor, function(err, newlyCreated){
       if (err){
           console.log(err);
       } else {
           res.redirect("/vendors");
       }
   });
        }
   });
});
//New- shows form to create vendor
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("vendors/new");
});
//Show- shows more info about a single vendor
//this neds to be declared after other items since it matches any thing after /vendors
router.get("/:id", function(req, res){
    Vendor.findById(req.params.id).populate("comments").exec(function(err, foundVendor){
        if(err || !foundVendor){
            req.flash("error", "Vendor not found");
            res.redirect("back");
        } else {
            
            
            
              res.render("vendors/show", {vendor: foundVendor});
        }
    });
  
});

//EDIT VENDOR ROUTE
router.get("/:id/edit",middleware.checkVendorOwnership, function(req, res){
        
         Vendor.findById(req.params.id).populate("comments").exec(function(err, foundVendor){
                if (err) {
                    req.flash("error", "Something went wrong");
                    res.redirect("back");
                }
                res.render("vendors/edit", {vendor: foundVendor}); 
    
         });
    
    
});

//UPDATE VENDOR ROUTE
router.put("/:id",middleware.checkVendorOwnership, middleware.isSafe,function(req, res){
    geocoder.geocode(req.body.vendor.location, function (err, data) {
        if (err || !data.results[0]){
             req.flash("error", "Something went wrong. Please fill out all fields");
            res.redirect("back");
        } else {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newData = {name: req.body.vendor.name, image: req.body.vendor.image, url: req.body.vendor.url, description: req.body.vendor.description, price: req.body.vendor.price, p: req.body.vendor.p, location: location, lat: lat, lng: lng, approved: false};
    
    //find and update the correct vendor
   
    Vendor.findByIdAndUpdate(req.params.id, newData, function(err, updatedVendor){
       if(err){
            res.redirect("/vendors");
       } else {
           res.redirect("/vendors/"+req.params.id);
       }
    });
        }
    });
});


//DESTROY VENDOR ROUTE
router.delete("/:id",middleware.checkVendorOwnership, function(req, res){
    Vendor.findByIdAndRemove(req.params.id, function(err){
        if (err){
            res.redirect("/vendors");
        } else {
            res.redirect("/vendors");
        }
    })
});


/////REPORT VENDOR ROUTES

//get report form
router.get("/:id/report", middleware.isLoggedIn, function(req, res){
    Vendor.findById(req.params.id, function(err, foundVendor){
        if(err || !foundVendor){
            req.flash("error", "Something went wrong");
            res.redirect("back");
        } else {
              res.render("vendors/report", {vendor: foundVendor, user: req.user});
        }
    });
   
});
//report post
router.put("/:id/report", middleware.isLoggedIn, function(req, res){
    var newData = {
        $push: {reportedBy: req.body.vendor.reportedBy}, 
        $set: {reportedCount: req.body.vendor.reportedCount}
        
    };
        Vendor.findByIdAndUpdate(req.params.id, newData, function(err, updatedVendor){
       if(err){
            res.redirect("/vendors");
       } else {
           res.redirect("/vendors");
       }
    });
    
});

//approve post
router.put("/:id/approve", middleware.isLoggedIn, function(req, res){
    var newData = {
        $set: {approved: true}
        
    };
        Vendor.findByIdAndUpdate(req.params.id, newData, function(err, updatedVendor){
       if(err){
            res.redirect("/vendors");
       } else {
           res.redirect("/vendors");
       }
    });
    
});

//approve comments
router.put("/:id/approvecomments", middleware.isLoggedIn, function(req, res){
    var newData = {
        $set: {reportedComment: false}
        
    };
        Vendor.findByIdAndUpdate(req.params.id, newData, function(err, updatedVendor){
       if(err){
            res.redirect("/adminpage");
       } else {
           res.redirect("/adminpage");
       }
    });
    
});


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;