var express=require("express");
var router=express.Router();
var Campground=require("../models/campgrounds");
var middleware=require("../middleware/index.js");
var multer = require('multer');
var async=require("async");
var controller=require("./controllers/campgroundsController.js")
var config=require("../config/config.js");


//===========================
//Multer Configuration 
//===========================

var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jfif|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: config.cloudinaryCloudName, 
  api_key: config.cloudinaryApiKey, 
  api_secret: config.cloudinaryApiSecret
});

//===================
//Router middleware
//===================
router.param("id",controller.paramFn);



//===========================
//CAMPGROUND ROUTES
//===========================



//Index-show all campgrounds
router.get("/",controller.getAllFn);



//Create route-add new campground to the DB
router.post("/", middleware.isLoggedIn, upload.single('image'), controller.postFn);

//New-Show form to create new campground
router.get("/new",middleware.isLoggedIn,controller.renderNewFn);


// Show-- shows more info about one campground
router.get("/:id",controller.getOneFn);


//Edit Campground Route
router.get("/:id/edit",middleware.checkCampgroundOwnership,controller.renderEditFn);



//Update Campground Route
router.put("/:id",upload.single('image'),middleware.checkCampgroundOwnership,controller.putFn);

//DESTROY CAMPGROUND ROUTE
router.delete("/:id",middleware.checkCampgroundOwnership,controller.deleteFn);




//===============
//Error handling middleware
//===============

router.use(controller.errFn);



module.exports=router;