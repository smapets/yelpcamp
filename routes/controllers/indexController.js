var User=require("../../models/user");
var passport=require("passport");
var async=require("async");
var crypto=require("crypto");
var nodemailer=require("nodemailer");
var middleware=require("../../middleware/index.js");
var Campground=require("../../models/campgrounds");
var config=require("../../config/config.js");


//show landing page
var landingFn=function(req,res){
    res.render("landing");
};

//show register form
var registerFormFn=function(req,res){
    res.render("register");

};


//show forgot form
var forgotFormFn=function(req, res) {
    res.render('forgot');
};


//register User
var registerFn=function(req,res){
    var newUser=new User({
        username:req.body.username,
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email,
        avatar:req.body.avatar
        
    });
    
    if(req.body.adminCode===config.adminCode){
        newUser.isAdmin=true;
    }
    User.register(newUser,req.body.password,function(err,user){
        if(err){
            req.flash("error",err.message);
            console.log(err);
            return res.redirect("/register");
        }passport.authenticate("local")(req,res,function(){
            req.flash("success","Welcome to YelpCamp "+ user.username);
            res.redirect("/campgrounds");
        });
    });
};


//logout user
var logoutFn=function(req, res) {
    req.logout();
    req.flash("error","logged you out!!!");
    res.redirect("/campgrounds");
};


//forgot POST function
var forgotFn=function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        if(err){
          done(err);
        }else{
          var token = buf.toString('hex');
          done(null, token);
        }
        
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user || err) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        user.save(function(err) {
          if(err){
            done(err);
          }else{
            done(null,token,user);
          }
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: config.gmailAddress,
          pass: config.gmailPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: config.gmailAddress,
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        if(err){
          done(err);
        }else{
          console.log('mail sent');
          req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          done(null, 'done'); 
        }
        
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
};


//reset GET Function
var resetGetFn=function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user || err) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      res.render('reset', {token: req.params.token});
    });
};


//reset POST Function
var resetPostFn=function(req, res,next) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user || err) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
            user.setPassword(req.body.password, function(err) {
              if(err){
                next(err);
              }else{
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                user.save(function(err) {
                req.logIn(user, function(err) {
                  done(err, user);
              });
            });
            }
            
          });
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: config.gmailAddress,
          pass: config.gmailPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: config.gmailAddress,
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    if(err){
      next(err);
    }else{
      res.redirect('/campgrounds');
    }

  });
};


//error handling middleware
var errFn=function(err,req,res,next){
        req.flash("error","Something went wrong!!!");
        res.redirect("/forgot");
};

module.exports={
    forgotFormFn,
    registerFormFn,
    landingFn,
    registerFn,
    logoutFn,
    forgotFn,
    resetGetFn,
    resetPostFn,
    errFn
};