// ------------------------- SET UP ---------------------------//

const express = require("express");
const router = express.Router();
const User = require('../models/userModel');
const passport = require('passport');
const {wrapAsyncErrorCatcher} = require("../middleware.js")

// --------------------- SIGN UP ----------------------------//

router.get('/register',function(req,res){
    res.render('users/register.ejs')
});

router.post('/register', wrapAsyncErrorCatcher(async function(req,res,next){
    try{
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser,err=>{ // here, we're loggin in the user after they register
            if(err) return next(err); // error handler
            //console.log(registeredUser);
            req.flash("success","Thank you for signing up!");
            res.redirect('/bathrooms');
        })
    } catch(e){
        req.flash('error',e.message);
        res.redirect('/register');
    }
}))

// --------------------- LOGIN ----------------------------//

router.get('/login',function(req,res){
    res.render('users/login.ejs')
})

router.post('/login', passport.authenticate('local',{failureFlash:true, failureRedirect:'/login'}), function(req,res){ // HEre, we're using the 'local' stratergy. we could also add a different route, as well as local, to autenticate through google or twitter.
    req.flash('success',"Welcome back!")
    const redirectUrl = req.session.returnTo || '/bathrooms' // here, we're creating a variable called 'return to' and using it to save the URL we're the user made the request, so after they log in, we can return them to the page they were on. Or, If there is not previous page data, we just take them to /bathrooms
    //console.log(redirectUrl)
    delete req.session.returnTo 
    res.redirect(redirectUrl);
})

// --------------------- LOGOUT ----------------------------//

router.get('/logout',function(req,res){
    req.logout();
    req.flash('success',"Goodbye!")
    res.redirect('/bathrooms');
})

// ------------------------- EXPORTING ---------------------------- //

module.exports = router;

