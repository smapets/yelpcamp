var express=require("express");
var router=express.Router();
var User=require("../models/user");
var passport=require("passport");
var async=require("async");
var crypto=require("crypto");
var nodemailer=require("nodemailer");
var middleware=require("../middleware/index.js");
var Campground=require("../models/campgrounds");
var config=require("../config/config.js");
var controller=require("./controllers/indexController.js");

//===================
//ROOT ROUTE
//===================

router.get("/",controller.landingFn);



//======================
//AUTH ROUTES
//======================

//show register form
router.get("/register",controller.registerFormFn);


//handle sign up logic
router.post("/register",controller.registerFn);

//show login form
router.get("/login",function(req, res) {
    res.render("login");
});

//handling login logic
router.post("/login",passport.authenticate("local",
    {successRedirect:"/campgrounds",
    failureRedirect:"/login"}),function(req, res) {
    
});

//logout route
router.get("/logout",controller.logoutFn);



//=====================
//PASSWORD RESET ROUTES
//=====================


//Forgot password route
router.route('/forgot')
  .get(controller.forgotFormFn)
  .post(controller.forgotFn);


//Reset password route
router.route('/reset/:token')
  .get(controller.resetGetFn)
  .post(controller.resetPostFn);



//=====================
//ERROR HANDLING MIDDLEWARE
//=====================

router.use(controller.errFn);




module.exports=router;