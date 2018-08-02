var express    = require("express"),
    app        = express(),
    PORT       = 5000||process.env.PORT;
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),
    multer     = require("multer"),
    fs         = require("fs");

var passport = require("passport"),
    localStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");

app.set("view engine","ejs");
app.use(express.static("assets"));
app.use(bodyParser.urlencoded({extended : true}));
mongoose.connect("mongodb://localhost/blogs_db");

//User Model
var userSchema = new mongoose.Schema({
	username : String,
	password : String,
});

userSchema.plugin(passportLocalMongoose);

var User = mongoose.model("User", userSchema);

app.use(require("express-session")({
    secret : "I am AJ",
    resave : false,
    saveUninitialized : false      
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Models
var blogSchema = new mongoose.Schema({
	    title : String,
	    image : String
});

var Blog = mongoose.model("Blog",blogSchema);



//Creating storage location for images
var storage = multer.diskStorage({
	destination : "assets/uploads/",
	filename    : function(req, file, cb){
        cb(null , file.fieldname + "-" + Date.now() + ".jpg");
	}
});

var upload = multer({storage : storage});

//====================
//       ROUTES
//====================

app.get("/", function(req, res){
   res.render("landing");
});

app.get("/blogs", function(req, res){
	Blog.find({},function(err, foundBlog){
        if(err)
            console.log(err);
        else
	        res.render("home", {blogs : foundBlog});
	});
});

app.get("/blogs/new", function(req, res){
	res.render("new");
});

app.post("/blogs", upload.single("uploaded"), function(req, res){
	let data = {
		image : req.file.path
	};
	Blog.create({
	        title : req.body.title,
		    image : req.file.path
	    }, function(err, foundBlog){
	    	if(err)
	    		console.log(err);
	    	else{
		        foundBlog.save();
                res.redirect("/blogs");
	    	}
    });
});


//Show Route
app.get("/blogs/:id", function(req, res){
    Blog.findById(req.params.id, function(err,foundBlog){
        if(err)
        	console.log(err);
        else
           res.render("view", {blog : foundBlog});
    });
});

//AUTH ROUTES
app.get("/register", function(req, res){
   res.render("register");
}); 

app.post("/register", function(req, res){
	var user = new User({username : req.body.username});
	User.register(user, req.body.password, function(err, newUser){
		if(err)
			console.log(err);
        else
        {
        	passport.authenticate("local")(req, res, function(){
         	    if(err)
         	     	 console.log(err);
                else
                {
                	res.redirect("/blogs");
                }
            });
        }
	});
});

app.get("/login", function(req, res){
	res.render("login");
});

app.post("/login", passport.authenticate("local",{
         successRedirect : "/blogs",
         failureRedirect : "/login"
    }));

app.post("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

app.listen(PORT, function(err){
   if(err)
       console.log(err);
   else
       console.log("Server started...");
});

