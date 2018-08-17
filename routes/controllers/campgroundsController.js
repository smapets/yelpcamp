var Campground=require("../../models/campgrounds");
var cloudinary = require('cloudinary');


var paramFn=function(req,res,next,id){
    //find the campground with provided id
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
             if(err || !foundCampground){
                req.flash("error","Campground not found!!");
                // console.log(err);
                return res.redirect("/campgrounds");
                
            }else{
            //go to next with foundCampground
                res.locals.campground=foundCampground;
                return next();
            }
        
});
};

var getCatFn=function(req,res,next){
    var noMatch;
    Campground.find({categories:req.params.category})
    .then(function(allCampgrounds){
            if(allCampgrounds.length<1){
                noMatch="Not campgrounds of this category exist!!";
            }
            res.render("campgrounds/index",{campgrounds:allCampgrounds,noMatch:noMatch});
            
        })
      .catch(function(err){
        if(err){
            req.flash("error","Not a valid query");
            return res.redirect("/campgrounds");
        }
       });
        
};

var getAllFn=function(req,res,next){
    var noMatch;
    // console.log(req.user);
    if(req.query.search || req.query.category){
         const regex = new RegExp(escapeRegex(req.query.search), 'gi');
         const category=req.query.category;
        //Get all campgrounds from db that match the query string
         Campground.find({name:regex,categories:category})
        .then(function(allCampgrounds){
            if(allCampgrounds.length<1){
                noMatch="No campgrounds match that query,please try again!!!";
            }
            res.render("campgrounds/index",{campgrounds:allCampgrounds,noMatch:noMatch});
            
        })
        .catch(function(err){
            next(err);
        });
        
    }else{
         Campground.find({})
            .then(function(allCampgrounds){
                res.render("campgrounds/index",{campgrounds:allCampgrounds,noMatch:noMatch});
            })
            .catch(function(err){
            next(err);
        });
    }
};

var postFn= async function(req, res,next) {
    try{
        var result=await cloudinary.v2.uploader.upload(req.file.path);
        // add cloudinary url for the image to the campground object under image property
        req.body.campground.image = result.secure_url;
        //add image's public id to campground object
        req.body.campground.imageId=result.public_id;
        // add author to campground
        req.body.campground.author = {
            id: req.user._id,
            username: req.user.username
          };
          req.body.campground.categories=req.body.categories;
         var campground=await Campground.create(req.body.campground);
         await res.redirect('/campgrounds/' + campground.id);
    }catch(err){
        next(err);
    }
};

var renderNewFn=function(req,res,next){
    try{
        res.render("campgrounds/new");
    }catch(err){
        next(err);
    }
};

var getOneFn=function(req,res,next){
    try{
        //console.log(foundCampground);
        var campground=res.locals.campground;
        res.render("campgrounds/show",{campground:campground});
    }catch(err){
        next(err);
    }
};

var renderEditFn=function(req,res,next){
    try{
        res.render("campgrounds/edit",{campground:res.locals.campground});
    }catch(err){
        next(err);
    }
};

var putFn=async function(req,res,next){
    //find and update the correct campground (already done in router.param)
    var campground=res.locals.campground;
    // async function(campground){
            //check is someone uploaded a new file
             if(req.file){
                 try {
                     //if there is destroy the existing image
                    await cloudinary.v2.uploader.destroy(campground.imageId);
                    var result= await cloudinary.v2.uploader.upload(req.file.path);
                    campground.imageId=result.public_id;
                    campground.image=result.secure_url;
                 }catch(err){
                    next(err);
                 }
                 
                
            }
            // update the rest info nonetheless
            campground.name=req.body.campground.name;
            campground.description=req.body.campground.description;
            campground.price=req.body.campground.price;
            campground.categories=req.body.categories;
            campground.save();
            req.flash("success","Successfully Updated!!");
            res.redirect("/campgrounds/"+req.params.id);
        
    
    
    //redirect somewhere (show page)
};

var deleteFn=async function(req,res,next){
        
           var campground=res.locals.campground;
           await cloudinary.v2.uploader.destroy(campground.imageId).catch(function(err){next(err)}); 
           await campground.remove().catch(function(err){next(err)}); 
           await req.flash("success","Campground, deleted succcessfully");
           await res.redirect("/campgrounds");
};

var errFn=function(err,req,res,next){
    req.flash("error",err.message);
    res.redirect("/campgrounds");
};



function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}


module.exports={
    paramFn,
    getAllFn,
    postFn,
    renderNewFn,
    getOneFn,
    getCatFn,
    renderEditFn,
    putFn,
    deleteFn,
    errFn
};
























