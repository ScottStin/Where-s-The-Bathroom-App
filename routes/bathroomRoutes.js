//---------- SET UP ------ //

const express = require('express');
const router = express.Router();
const Bathroom = require('../models/bathroomModel.js'); // this is getting the bathroom model we exported from the bathroommodel.js file
//const Joi = require("joi"); // joi is used for client side validation shortcuts
//const Joi = require('../middleware.js'); // joi is used for client side validation shortcuts. Here, we're not using the NPM version of joi we installed, we're using an altered version we created in our middleware doc.
const {isLoggedIn, isAuthor, wrapAsyncErrorCatcher, AppExpressError, Joi} = require("../middleware.js"); // we should add extraValidatationBathroom bathroom to this list
const multer = require('multer'); // this is used to submit html forms with more than one data type 
const {cloudinary, storage} = require('../cloudinary.js')
//const upload = multer({ dest: 'uploads/' }); // we stored photos in this folder until we were ready to use cloudinary
const upload = multer({ storage}); // storage on cloudinary
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

// --------------------  VALIDATION SCHEMA MIDDLEWARE ---------------------

const extraValidatationBathroom = function(req,res,next){ // This will be used as an extra layer of validation, to ensure that the client doesn't use postman to sneak past our existing validation and submit invalid data to our server.
    // if(!req.body.bathroom) throw new AppExpressError('Invalid Bathroom Data',400); // this will prevent the client from using postman to bypass our client side validation and upload data to our website that is invalid. However, we can remove it and use Joi instead, to save us saving to write this code for every field that we upload
    const bathroomSchema = Joi.object({ // this replaces the code on the line above to prevent the client from using postman to bypass our client side validation and upload data to our website that is invalid
        bathroom: Joi.object({ // note, if we leave something off here (e.g. no address) that's on our form, we'll get an error
            name:Joi.string().required().escapeHTML(),
            address: Joi.string().required().escapeHTML(),
            image: Joi.string().escapeHTML(),
            description: Joi.string().escapeHTML(),
            price: Joi.number()//.escapeHTML()//.required()//.min(0) // (note, we can only add escapeHTML to strings)
        }).required(),
        deleteImages:Joi.array() // this will be used to select images to delte on our edit form. Images with marked with the checkbox with the name deleteImages[] will be deleted
    })
    const { error } = bathroomSchema.validate(req.body);
    if (error){
        console.log(error)
        const msg = error.details.map(el => el.message).join(',')
        throw new AppExpressError(msg, 400)
    } else{
        next();
    }
}

// ---------- DISPLAY ALL BATHROOMS ------//

router.get('/', wrapAsyncErrorCatcher(async function(req,res){
    const bathrooms = await Bathroom.find({});
    res.render('bathrooms.ejs', {bathrooms});
}));

// ---------- CREATE NEW BATHROOM ------ //

router.get('/new', isLoggedIn, function(req,res){
    res.render('new.ejs');
});

router.post('/', isLoggedIn,  upload.array('image'), extraValidatationBathroom, wrapAsyncErrorCatcher(async function(req,res,next){ // we're proctect the psot route with isloggedin, even though the get router is already proctected, incase the client uses postman to skip the getroute and post something without being logged in. NOTE: we should validate before we uploadnthe images, but that's not working, so we need to come up with a solution
   const geoData = await geocoder.forwardGeocode({
        query: req.body.bathroom.address,//'Yosemite, CA',
        limit: 1
    }).send()
    const  bathroom = new Bathroom(req.body.bathroom);
    bathroom.geometry = geoData.body.features[0].geometry; // this will take the address the user put into the req.body, return coordinates, and then save the coordinates in our model under geometry
    bathroom.images = req.files.map(f=>({url: f.path, filename: f.filename})); // this will create an array with 2 objects (filename and url).
    bathroom.author = req.user._id;  
    await bathroom.save();
    console.log(bathroom)  
    req.flash('success','Thank you for adding this loo!')
    res.redirect(`/bathrooms/${bathroom._id}`)
}));

// router.post('/',upload.array('image'),function(req, res){ // here, we're getting the 'image' upload form from our ejs new file and using the multer middleware to convert our file into a useable form and store it on our cloud (AWS, Cloudanary etc.). The name 'image' need to match whatever name we give our file uploader in our EJS doc
//     //res.send(req.body);
//     //res.send(req.file);
//     console.log(req.body,req.files) // for single, we use req.file. For array, we use req.files
//     res.send("It Worked")
// }) // we can do upload.single for one file or upload.array for multiple files. However, if we're using an array, we have to set our image uploader in our ejs doc to be 'multiple'

// ---------- SHOW A BATHROOM ------ //

router.get('/:id', wrapAsyncErrorCatcher(async function(req,res){
    const bathrooms = await Bathroom.findById(req.params.id).populate({path:"reviews", populate:{path:"author"}}).populate("author"); // here, we're populating the author of the bathroom, however, the author of the review may be different to the author of the bathroom, so we have to do this nested populate with paths to get both the euthor and bathroom populated
    res.render('show.ejs',{bathrooms});
}));

// ---------- EDIT BATHROOM ------ //

router.get('/:id/edit', isLoggedIn, isAuthor, wrapAsyncErrorCatcher(async function(req,res){ // we've put isloggedin before isauthor, becausee we should see if they're logged in before we check if they're the author.
    const { id } = req.params;
    const bathrooms = await Bathroom.findById(id); 
    if(!bathrooms){
        req.flash('error','Cannot find bathroom');
        return res.redirect('/bathrooms')
    }
    res.render('edit.ejs',{bathrooms})
}));

router.put ('/:id', isLoggedIn, isAuthor, upload.array('image'), extraValidatationBathroom, wrapAsyncErrorCatcher(async function(req,res){
    const { id } = req.params;
    const bathroom = await Bathroom.findByIdAndUpdate(id,{ ...req.body.bathroom}); // here, we're using the spread operator to spread one object into another(i.e the new bathrom paras into the old object)
    const imgs = req.files.map(f=>({url: f.path, filename: f.filename})); // this will create an array with 2 objects (filename and url). 
    bathroom.images.push(...imgs) // Unlike the code used to create a bathroom, we need to 'push' here so we don't overide the entire array. However, because the above code makes an array, we can't push an array onto any array. So instead, we save the above array as 'imgs', take the data from it a spread it. So we're passing through the data rather than pushing the array.
    await bathroom.save()
    if(req.body.deleteImages){
        for(let i=0;i<req.body.deleteImages.length; i++){
            await cloudinary.uploader.destroy(req.body.deleteImages[i]); // this will delete from cloudinary
        }
        await bathroom.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}}) // here, we're 'pulling' (deleting) the images from out bathroom that match the images in our deleteImage array (the images we selected for deletion on our edit page)
    }
        if(req.user && !bathroom.author == req.user._id){ // this is an extra layer of security to protect this route in the event that the user uses postman to edit our bathrooms without logging in.
        req.flash('Error, you do not have permission to do that.')
        return res.redirect(`/bathrooms/${id}`)
    } // NOTE: we use req.user on the backend and currentuser on our ejs front end docks.
    req.flash('update','Your bathroom details have been changed.')
    res.redirect(`/bathrooms/${bathroom._id}`)
}));

// ---------- DELETE BATHROOMS ------ //

router.delete ('/:id', isLoggedIn, isAuthor, wrapAsyncErrorCatcher(async function(req,res){
    //res.send("IT WORKED")
    const { id } = req.params;
    await Bathroom.findByIdAndDelete(id); 
    req.flash('remove','Bathroom deleted')
    res.redirect("/bathrooms")
}));

// ---------- EXPORTING ------ //

module.exports = router;