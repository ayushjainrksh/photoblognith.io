var express = require("express"),
    app     = express(),
    PORT    = 5000||process.env.PORT;
    bodyParser = require("body-parser"),
    mongoose = require("mongoose");


app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended : true}));
mongoose.connect("mongodb://localhost/blogs_db");

var blogSchema = new mongoose.Schema({
	    title : String,
	    image : String,
	    date  : Number
});

var Blog = mongoose.model("Blog",blogSchema);

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

app.post("/blogs", function(req, res){
	Blog.create({
	        title : req.body.title,
	        image : req.body.image,
	        date  : Date.now()
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
     // res.send("Hello");
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
