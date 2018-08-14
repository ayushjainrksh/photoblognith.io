var express    = require("express"),
    app        = express(),
    PORT       = 5000||process.env.PORT;
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),
    multer     = require("multer"),
    fs         = require("fs"),
    methodOverride = require("method-override");

var passport = require("passport"),
    localStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");

app.set("view engine","ejs");
app.use(express.static("assets"));
app.use(bodyParser.urlencoded({extended : true}));
app.use(methodOverride("_method"));
mongoose.connect("mongodb://localhost/blogs_db");

//=========
// MODELS
//=========

//User Model
var userSchema = new mongoose.Schema({
	username : String,
	password : String,
});

userSchema.plugin(passportLocalMongoose);

var User = mongoose.model("User", userSchema);


//Blog Model
var blogSchema = new mongoose.Schema({
	    title : String,
	    image : String,
	    description : String,
	    author : {
	    	id : {
	    		type : mongoose.Schema.Types.ObjectId,
	    		rel : "User"
	    	},
	    	username : String
	    }
});

var Blog = mongoose.model("Blog",blogSchema);


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

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});



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

app.get("/blogs/new", isLoggedIn, function(req, res){
	res.render("new");
});

app.post("/blogs", upload.single("uploaded"), isLoggedIn, function(req, res){
	Blog.create({
	        title : req.body.title,
		    image : req.file.path,
		    description : req.body.description,
		    author : {
		    	id : req.user._id,
		    	username : req.user.username
		    }
	    }, function(err, foundBlog){
	    	if(err)
	    		console.log(err);
	    	else{
		        foundBlog.save();
                res.redirect("/blogs");
	    	}
    });
});


app.get("/blogs/find",function(req, res){
	// var name = req.body.search;
	// console.log("Received");
	// console.log(req.query.titleSearch);
    var query = {title : req.query.titleSearch};
    // console.log(req.body.titleSearch);
	Blog.find(query, function(err, foundBlog){
         if(foundBlog)
         {
            console.log(foundBlog);
            res.redirect("/blogs");
         }
         else
         {
         	console.log("Not found");
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

// Edit Route
app.get("/blogs/:id/edit",isAuth, function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err)
        	res.redirect("/blogs");
        else
            res.render("edit", {blog:foundBlog}); 
    });
});

app.put("/blogs/:id", upload.single("uploaded"), isAuth, function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        fs.unlink(foundBlog.image, function(err){
            if(err)
               console.log(err);
            else 
            {
		       	var title = req.body.title;
			    var image = req.file.path;
			    var description = req.body.description;
			    var blog = {
			    	title : title,
			    	image : image,
			    	description : description
			    };
			    console.log(blog);
		        Blog.findByIdAndUpdate(req.params.id, blog, function(err, updatedBlog){
			        if(err)
			        	res.redirect("/blogs");
			        else{
			        	res.redirect("/blogs/"+req.params.id);
		            }
			    });
            }
        });
    }); 
});

//Destroy Route
app.delete("/blogs/:id/delete",isAuth, function(req, res){
	Blog.findByIdAndRemove(req.params.id, function(err, foundBlog){
		if(err)
			console.log(err);
		else{
			fs.unlink(foundBlog.image, function(err){
				if(err)
					console.log(err);
			});
			res.redirect("/blogs");
		}
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

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/blogs");
});






//Auth functions
function isLoggedIn(req, res, next){
	if(req.user)
		return next();
	res.redirect("/login");
}

function isAuth(req, res, next){
	if(req.isAuthenticated())
	{
		Blog.findById(req.params.id, function(err, foundBlog){
	    	if(err)
	    	{
	    		res.redirect("back");
	    	}
	    	else
	    	{
	    		if(foundBlog.author.id.equals(req.user._id)){
	    			return next();
	    		}
	    		res.redirect("back");
	    	}
		});
	}
    else
    {
    	res.redirect("/login");
    }
}

function stringMatch(String one,String two)
{
	var smaller = one.length<two.length?one:two;
    var count=0;
    one.split('').sort().join('');
    two.split('').sort().join('');
    console.log(one+" "+two);
    for(int i=0;i<smaller.length;i++)
    {
    	if(one[i]==two[i])
    	{
    		count++;
    	}
    }
    if(count===smaller.length)
    	return true;
    else
    	return false;
}

// return text.split('').sort().join('');

app.listen(PORT, function(err){
   if(err)
       console.log(err);
   else
       console.log("Server started...");
});