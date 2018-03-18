var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    flash       = require("connect-flash"),
    localStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Vendor  = require("./models/vendor"),
    Comment     = require('./models/comment'),
    User        = require("./models/user"),
    seedDB      = require("./seeds");

//requiring routes
var commentRoutes = require("./routes/comments"),
    vendorRoutes = require("./routes/vendors"),
    indexRoutes = require("./routes/index"),
    messageRoutes = require("./routes/messages");

//seedDB(); //seed the database
mongoose.connect("mongodb://localhost/pockets");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require("moment");

// PASPORT CONFIG
app.use(require("express-session")({
    secret: process.env.PASSPORTSECRET, 
    resave:false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(indexRoutes);
app.use("/vendors", vendorRoutes);
app.use("/vendors/:id/comments", commentRoutes);
app.use("/", messageRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Pockets server has started!");
});