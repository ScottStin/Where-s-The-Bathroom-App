//---------- SET UP ------ //

const express = require('express');
const router = express.Router({mergeParams:true}); // this is important to make sure our reviews and bathrooms routes have access to eachotheer
const Bathroom = require('../models/bathroomModel.js'); // this is getting the bathroom model we exported from the bathroommodel.js file
const Review = require('../models/reviewModel.js'); 
//const Joi = require("joi") // joi is used for client side validation shortcuts
//const Joi = require('../middleware.js'); // joi is used for client side validation shortcuts. Here, we're not using the NPM version of joi we installed, we're using an altered version we created in our middleware doc.
const {isLoggedInReview, isReviewAuthor, wrapAsyncErrorCatcher, AppExpressError, Joi} = require("../middleware.js")

// --------------------  VALIDATION SCHEMA MIDDLEWARE --------------------- // we should put this into a utils folder and require it in our route and index fodler rather than typing it out each time.

const extraValidationReview = function(req,res,next){
    const reviewSchema = Joi.object({
        review: Joi.object({
            rating: Joi.number().required().min(1).max(5),
            body: Joi.string().required().escapeHTML(),
            image: Joi.string().escapeHTML(),
            user: Joi.string().escapeHTML(),
        }).required()
    })
    const { error } = reviewSchema.validate(req.body);
    if (error){
        console.log(error)
        const msg = error.details.map(el => el.message).join(',')
        throw new AppExpressError(msg, 400)
    } else{
        next();
    }
}

// ---------------------  POST REVIEW --------------------

router.post('/', isLoggedInReview, extraValidationReview, wrapAsyncErrorCatcher(async function(req,res){
    //res.send("Review Submitted")
    const bathroom = await Bathroom.findById(req.params.id)
    const review = new Review(req.body.review) // because in the shoow.ejs file we gave everything in the form the name of review[rating], review[body] etc., here, we can just imported req.body.review to get it all
    review.author = req.user._id;
    bathroom.reviews.push(review);
    await review.save();
    await bathroom.save();
    req.flash('success','Thank you for reviewing this loo!')
    res.redirect(`/bathrooms/${bathroom._id}`)
}))

// --------------------  DELETE REVIEW -------------------- 

router.delete('/:reviewId', isLoggedInReview, isReviewAuthor, wrapAsyncErrorCatcher(async function(req,res){ // we need the delete path to have the bathroom then the review because we want to delete the view saved in the review model, and the reference saved in the parent model
    const{id, reviewId} = req.params;
    await Review.findByIdAndDelete(req.params.reviewId);
    await Bathroom.findByIdAndUpdate(id,{$pull:{reviews:reviewId}}); // this line of code is used to get rid of the review stored in the bathroom model. We're 'pulling' the review from the array, not deleting the whole object. That's why we're using findandupdate not findanddelete
    req.flash('remove','Review deleted')
    res.redirect(`/bathrooms/${id}`);
    //res.send('success')
})) 

// ---------- EXPORTING ------ //

module.exports = router;