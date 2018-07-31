var express    = require("express"),
    app        = express(),
    PORT       = 5000||process.env.PORT;
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),
    multer     = require("multer"),
    fs         = require("fs");


app.set("view engine","ejs");
app.use(express.static("assets"));
app.use(bodyParser.urlencoded({extended : true}));
mongoose.connect("mongodb://localhost/blogs_db");

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

app.listen(PORT, function(err){
   if(err)
       console.log(err);
   else
       console.log("Server started...");
});
