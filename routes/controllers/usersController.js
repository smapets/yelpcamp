var User=require("../../models/user");
var Campground=require("../../models/campgrounds");
var middleware=require("../../middleware/index.js");

var paramFn=function(req,res,next,id){
    //find the campground with provided id
    User.findById(req.params.id,function(err,foundUser){
        if(err||!foundUser){
            next(err);
        }else{
            res.locals.foundUser=foundUser;
            next();
        }
    });
};

var getFn=async function(req, res,next) {
    try{
        var foundUser=res.locals.foundUser;
        var campgrounds=await Campground.find().where('author.id').equals(foundUser._id).exec();
        await res.render("users/show",{user:foundUser,campgrounds:campgrounds});
    }catch(err){
        next(err);
    }
};

var renderEditFn=async function(req,res,next){
    try{
        var foundUser=res.locals.foundUser;
        await res.render("users/edit",{user:foundUser});
         
    }catch(err){
        next(err); 
    }
};

var putFn=async function(req,res,next){
    try{
        await User.findByIdAndUpdate(req.params.id,req.body.user);
        await res.redirect("/users/"+req.params.id);
    }catch(err){
        next(err);
    }
};

var errFn=function(err,req,res,next){
        req.flash("error","Something went wrong!!!");
        res.redirect("/");
};

module.exports={
    paramFn,
    getFn,
    renderEditFn,
    putFn,
    errFn
};