var Campground=require("../../models/campgrounds");
var Comment=require("../../models/comment");
var express=require("express");
var middleware=require("../../middleware/index.js");


var paramFn=function(req,res,next,comment_id){
        Campground.findById(req.params.id,function(err, foundcampground) {
        if(err || !foundcampground){
            req.flash("error","No campground found");
            return res.redirect("/campgrounds");
        }else{
            Comment.findById(req.params.comment_id,function(err, foundComment) {
                if(err){
                    req.flash("error","No comment found");
                    return res.redirect("/campgrounds/"+req.params.id);
                }else{
                    res.locals.foundComment=foundComment;
                    // next({campground_id:req.params.id,comment:foundComment});
                    next();
                }
            }); 
        }
            
    });
};

var newCommFn=async function(req,res,next){
    //find campground by id
    try{
        var campground=await Campground.findById(req.params.id);
        res.render("comments/new",{campground:campground});
    }catch(err){
        next(err);
    }
};

var postFn=async function(req,res,next){
    try{
        //lookup campground using ID
        var campground=await Campground.findById(req.params.id);
        //Comment create
        //comment returns an object {title:"...",author:"...."}
        var comment=await Comment.create(req.body.comment);
        //add username and id to comment
        comment.author.id=req.user._id;
        comment.author.username=req.user.username;
        //save comment
        comment.save();
        campground.comments.push(comment);
        campground.save();
        //redirect campground to show page
        req.flash("success","Fully added comment!!!");
        res.redirect("/campgrounds/"+campground._id);
    }catch(err){
        next(err);
    }
};

var editFn=function(req,res,next){
    try{
        var foundComment=res.locals.foundComment;
        res.render("comments/edit",{campground_id:req.params.id,comment:foundComment});
    }catch(err){
        next(err);
    }
};

var putFn=async function(req,res,next){
    try{
       var updatedComment=await Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment);
       await res.redirect("/campgrounds/"+req.params.id);
    }catch(err){
        next(err);
    }
};

var deleteFn=async function(req,res,next){
    //find and remove
    try{
        await Comment.findByIdAndRemove(req.params.comment_id);
        await req.flash("success","Comment deleted");
        await res.redirect("/campgrounds/"+req.params.id);
    }catch(err){
        next(err);
    }
};

var errorFn=function(err,req,res,next){
    req.flash("error","Something went wrong");
    res.redirect("back");
};

module.exports={
    paramFn,
    newCommFn,
    postFn,
    editFn,
    putFn,
    deleteFn,
    errorFn
};