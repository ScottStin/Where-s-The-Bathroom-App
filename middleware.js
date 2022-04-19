const Bathroom = require('./models/bathroomModel.js'); // this is getting the bathroom model we exported from the bathroommodel.js file
const Review = require('./models/reviewModel.js');
const BaseJoi = require("joi"); // we're calling this base joi, not joi, because we'll be using it as an extension. Below we'll refine Joi as an extension of basejoi that stops the user from using their own scripts and HTML on our forms
const sanitizeHTML = require('sanitize-html'); // this will be added to joi to help it  makesure the user doesn't hack us with their own HTML or Javascript

// -------------------- LOGIN AUTHORISATION ---------------- //

module.exports.isLoggedIn  = function(req,res,next){    
    if (!req.isAuthenticated()){ // isAuthenticated is a method that automatically comes with passport
        req.session.returnTo=req.originalUrl
        req.flash('error','You must be signed in to create a bathroom')
        return res.redirect('/login')
    }
    next();
}
module.exports.isLoggedInReview  = function(req,res,next){    
    if (!req.isAuthenticated()){ // isAuthenticated is a method that automatically comes with passport
        req.session.returnTo=req.originalUrl.slice(0,-8)
        req.flash('error','You must be signed in to leave a review')
        return res.redirect('/login')
    }
    next();
}

// -------------------- AUTHOR AUTHORISATION ---------------- //

module.exports.isAuthor = async function(req,res,next){
    const {id} = req.params;
    const bathrooms = await Bathroom.findById(id)
    if(!bathrooms.author.equals(req.user._id)){ // this is an extra layer of security to protect this route in the event that the user uses postman to edit our bathrooms without logging in.
        req.flash('error', 'you do not have permission to do that.');
        return res.redirect(`/bathrooms/${id}`);
    } // NOTE: we use req.user on the backend and currentuser on our ejs front end docks.
    next();
}

module.exports.isReviewAuthor = async function(req,res,next){
    const {id, reviewId} = req.params; // we need to destruction both id and reviewid from the params because our route has both bathrooms and review id
    const review = await Review.findById(reviewId)
    if(!review.author.equals(req.user._id)){ // this is an extra layer of security to protect this route in the event that the user uses postman to edit our bathrooms without logging in.
        req.flash('error', 'you do not have permission to do that.');
        return res.redirect(`/bathrooms/${id}`);
    } // NOTE: we use req.user on the backend and currentuser on our ejs front end docks.
    next();
}

// -------------------- ERROR HANDLING ---------------- //

module.exports.wrapAsyncErrorCatcher = function (fn){ 
    return function(req,res,next){
        fn(req,res,next).catch(e=>next(e))
    }
} 

module.exports.AppExpressError = class AppExpressError extends Error{
    constructor(message,status){
        super();
        this.message = message;
        this.status = status;
    }
}

// ------------------- JOI SANATIZATION OF HTML ------------- //

// Note: This is added onto our joi to ensure the user can't attack us with a Cross Site Scripting attack and hack us
// Basically, this prevents the user from entering their own HTML and Scripts into our forms
// This technically isn't middleware, and should be in another file, erhaps in utilities or schemas.

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHTML(value, {
                    allowedTags: [], // here, we're saying that nothing is allowed to be entered. We could add h1s or something in here to allow them
                    allowedAttributes: {}, // like wise, nothing is allowed.
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

module.exports.Joi = BaseJoi.extend(extension) // now we can add escapeHTML to our joi to stop users from hacking us with their own html and javascript
