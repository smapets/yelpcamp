var express=require("express");
var router=express.Router({mergeParams:true});
var Campground=require("../models/campgrounds");
var Comment=require("../models/comment");
var middleware=require("../middleware/index.js");
var controller=require("./controllers/commentsController.js");

//===================
//Router middleware
//===================
router.param('comment_id',controller.paramFn);

//===========================
//COMMENTS ROUTES
//===========================
//comments- new
router.get("/new",middleware.isLoggedIn, controller.newCommFn);

//comments-create
router.post("/",middleware.isLoggedIn, controller.postFn);


//comments-edit route
router.get("/:comment_id/edit",middleware.checkCommentOwnership,controller.editFn);



//comment-update route
router.put("/:comment_id",middleware.checkCommentOwnership, controller.putFn);

//Comment-destroy route
router.delete("/:comment_id",middleware.checkCommentOwnership, controller.deleteFn);

//===============
//Error handling middleware
//===============
router.use(controller.errorFn);




module.exports=router;