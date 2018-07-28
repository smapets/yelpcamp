var express=require("express");
var router=express.Router({mergeParams:true});
var User=require("../models/user");
var passport=require("passport");
var async=require("async");
var crypto=require("crypto");
var nodemailer=require("nodemailer");
var middleware=require("../middleware/index.js");
var Campground=require("../models/campgrounds");
var controller=require("./controllers/usersController.js")


//===========================
//USER ROUTES
//===========================

//===================
//Router middleware
//===================
router.param("id", controller.paramFn);


//User profile
//get user profile
router.get("/:id",controller.getFn);



//render user profile edit form
router.get("/:id/edit",middleware.checkUserProfileOwnership,controller.renderEditFn);


//update user profile
router.put("/:id",controller.putFn);


//error handling middleware
router.use(controller.errFn);

module.exports=router;