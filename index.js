// -------------------- SET UP --------------------

// install git (if not already installed on machine: https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
// 'npm init -y' 
// install the VS extention 'EJS Language Support' by DigitalBrainstem (if it hasn't already been installed)
// lunch 5 windows of gitbash - one for mongo, one for nodemon, one for mongod (run mongod in the background), one for heroku (only needed when in production phase), and one for github

// npm i: 
        //express mongoose 
        // joi (joi is used for client side validation shortcuts) // note: another package called express-validator can be used instead of joi. THis comes with an adding secruity layer that prevents the user from making Cross Site Scripting attacks to enter html or javascript into a form and hacking our site. However, express-validator has really bad syntex, so we used joi instead.
        // cookie-passer express-session connect-flash (used for cookies, sessions and flash messages)
        // method-override (needed for patch and put requests) 
        // ejs ejs-mate (emedded javascript used to create boilerplates instead and partials) 
        // passport passport-local passport-local-mongoose (authentication and autharisation) 
        // multer (used to submit HTML forms with more than one input enctype) 
        // dotenv (used to hide credintials for APIs and servrices like AWS and Cloudanary, so we can use them in our app but if someone looks at our code they don't see our login details)
        // cloudinary multer-storage-cloudinary (used to store photos aand other large files that won't fit on mongoDB)
        // @mapbox/mapbox-sdk (useful for converting physical addres into lat and long data to be used on maps)
        // express-mongo-sanitize (used to stop hackers entering mongo quiries into form inputs to hack our system with a mongo injection attack. For example, when we ask for a username and query our db with db.user.find({username: req.body.username}), a user could enter '$gt':"" to return all usernames greater than an empty string (thus retrieving all users). This package prvents the user from using special characters like $ or : or "" in their input
        // sanitize-html (used with joi to prevent cross site scripting - where the user enters their own html or javascript into our forms to try to hack/attack us)
        // helmet (used to add extra secruity to our app to stop hackers)
        // connec-mongo // in development mode, express-session uses a 'memory store' to store our session data. This doesn't hold a lot of information, is slow and doesn't scale well. In production mode, we'll use mongo to store our sessions. Connect-mongo helps with this.

// Create the following folders:
    // Main Folder (app name)
        //index.js (also often called app.js)
        //cloudinary.js
        // middleware.js (used to store middleware)
        //package-lock.json (created autmatically with npm init)
        //package.json (created autmatically with npm init)
        // .gitignore // add .env and node_modules to the .gitignore file by typing them in.
        //.env (used to store API, AWS or cloudanary passwords)
        // models
            //insert mongoose schema modles (js files) in this folder
        // public 
            // js scripts
                // insert your js script files here
            // stylesheets
                //insert your css classes here
        //routes
            // js route files go here
        // seeds
            // seeding files here
        // uploads (this file will be created autmoatically when you start uploading with multer, no need to create it)
            // this is where we save our photos uploaded to AWS or cloudanary while in develoment mode 
        // views 
            // partials
                // ejs files to add to other files, like the header, footer, nav bar, flash et.c
            // layouts
                // ejs boilerplate
            // all other ejs files, organises into folders
        
// -------------------- DEVELOPMENT or PRODUCTION MODE --------------------

if(process.env.NODE_ENV !=="production"){ // before we launch our app, we will work in development mode. During this phrase, this line of code will ensure we get our login details for APIs and services like AWS, Cloudanary from the .env file. 
    require('dotenv').config();
}

//const dbUrl = process.env.DB_URL; // used for production. Note - this DB_URL, which is saved in our .env file, is generate by mongo cloud atlas under 'connect_>connect your application' on our cloud.nongodb dashboard
//const dbUrl = 'mongodb://localhost:27017/wheres-the-bathoom-DB' // used for local development
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/wheres-the-bathoom-DB'

// save in .ev file: mongodb+srv://<username>:<password>@cluster0.eaato.mongodb.net/myFirstDatabase?retryWrites=true&w=majority // we'll be using a mongo service called 'atlas' for our production database - which is a global cloud service. However, there are other services, like AWS, that we could use instead.
// for information on how to set this up see: https://www.udemy.com/course/the-web-developer-bootcamp/learn/lecture/22361202#questions/13782892

// install Heroku CLI on computer (if haven't done so already): https://devcenter.heroku.com/articles/heroku-cli#install-the-heroku-cli // this will be used to launch our app.
// git init
// login by typing 'heroku login' in our command line, then press any key then log in through the browser/
// make sure the dbURL being used is the DB_URL in the .env folder. Also do the same with secretKey.
// in the heroku dashboard, vreate a new app and give it a name e.g "my-app-name"
// When ready to launch, navigate to prject folder in github and run (note: anytime we make changes to our app, we need to do this again from git commit then heroku login (add git:remote if you've used a different git respository recently)):
    // heroku create // you should see a name of the app appear (random weird name). Copy and paste the URL into your browser. Alternatively, use the app name you've created in heroku. You made need to use control c to escape after loggin in
    // heroku git:remote - my-app-name
    // git remote -v
    // git add .
    // git commit -m "name of commit"
    // git push heroku master

// add "start": "node index.js" to scripts in pakages.json file
// add keys from .env file into heroku under Personal -> appName -> settings -> Config Vars -> Reveal Config Vars (this can also be done in the command line with heroku config:set KEY=VALUE)
// note: you can run error logs in the command line by typing: heroku logs --tail
// in our Mogno Atlas Dashboard, click 'network access and add a new IP address. This time, instead of adding our own, we're going to 'allow access from anywhere'.
// finally, run 'heroku restart' in the terminal

// -------------------- REQUIRE NODE PACKAGES --------------------

const mongoose = require('mongoose'); 
const express = require("express");
const path = require('path'); // note, ejs will only run if the active folder in the terminal contains the views folder. // If we want this to work from different directories, we are going to require this 'path' module from express.
const methodOverride = require('method-override'); // we can't use 'patch' 'put' and 'delete' requested in the browswer. So instead, we use 'method overdide' to allow us to use them. For this to work, we need to npm i
const ejsMateEngine = require('ejs-mate'); // this will be used to create boilerplates that can be used intead of partials.
const Joi = require("joi") // joi is used for client side validation shortcuts
const session = require('express-session');
const flash = require('connect-flash');
const { resolve6 } = require('dns');
const { join } = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize'); // (used to stop hackers entering mongo quiries into form inputs to hack our system. For example, when we ask for a username and query our db with db.user.find({username: req.body.username}), a user could enter '$gt':"" to return all usernames greater than an empty string (thus retrieving all users). This package prvents the user from using special characters like $ or : or "" in their input
const helmet = require ('helmet');// used to add an extra layer of secruity to our app to stop hackers
const MongoDBStore = require("connect-mongo")//(session); // the (session) syntax is only used for older versions of connect-mongo

// -------------------- GENERAL EXPRESS SETUP --------------------

const app = express();
app.use(express.urlencoded({extended:true}));// this lets us take data from post or get requests and use it 
app.use(express.json());// this will let us get json requests and parse them 
app.use(methodOverride('_method')); // this will allow us to use delete, put and patch requetstes in our browswer
app.use(express.static(path.join(__dirname,'public'))); // this lets us get our CSS and JS files from the public directory to use

// ----------------------APP SECRUITY AND PROTECTION -----------------

app.use(mongoSanitize()); // You could also use something like app.use(mongoSanitize({replaceWith:'_'})) to replace all prohibited characters with an underscore. (used to stop hackers entering mongo quiries into form inputs to hack our system. For example, when we ask for a username and query our db with db.user.find({username: req.body.username}), a user could enter '$gt':"" to return all usernames greater than an empty string (thus retrieving all users). This package prvents the user from using special characters like $ or : or "" in their input
// app.use(
//     helmet({ // used to add an extra layer of secruity to our app to stop hackers
//         contentSecurityPolicy: false, // stops helmet from blocking our images and stylesheets. You could also use the code below, but that seems to break out random image
//   );
// app.use(helmet());
//   const scriptSrcUrls = [
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://api.mapbox.com/",
//     "https://kit.fontawesome.com/",
//     "https://cdnjs.cloudflare.com/",
//     "https://cdn.jsdelivr.net",
// ];
// const styleSrcUrls = [
//     "https://kit-free.fontawesome.com/",
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.mapbox.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://fonts.googleapis.com/",
//     "https://use.fontawesome.com/",
//     "https://cdn.jsdelivr.net",
// ];
// const connectSrcUrls = [
//     "https://api.mapbox.com/",
//     "https://a.tiles.mapbox.com/",
//     "https://b.tiles.mapbox.com/",
//     "https://events.mapbox.com/",
// ];
// const fontSrcUrls = [];
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: [],
//             connectSrc: ["'self'", ...connectSrcUrls],
//             scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//             styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//             workerSrc: ["'self'", "blob:"],
//             objectSrc: [],
//             imgSrc: [
//                 "'self'",
//                 "blob:",
//                 "data:",
//                 "https://res.cloudinary.com/dkny57jpp/", //SHOULD MATCH CLOUDINARY ACCOUNT! 
//                 "https://images.unsplash.com/", 
//                  "https://source.unsplash.com/",
//                 // "https://source.unsplash.com/random/?toilet",
//                 // "https://source.unsplash.com/random/?toile#",
//             ],
//             fontSrc: ["'self'", ...fontSrcUrls],
//         },
//     })
// );

// -------------------- REQUIRE MODELS --------------------

const Bathroom = require('./models/bathroomModel.js'); // this is getting the bathroom model we exported from the bathroommodel.js file
const Review = require('./models/reviewModel.js');
const User = require('./models/userModel');

// -------------------- COOKIES, SESSIONS, PASSPORT (AUTHENTICATION and AUTHORISATION) AND FLASH --------------------

const secretKey = process.env.SECRET || 'placeHolderKey'; // process.env.SECRET is used for production and 'placeHolderKey' is used for development

const store =  MongoDBStore.create({ // here, we're using mongo-connect (see our require section) to store our sessions during production
    mongoUrl:dbUrl, // note, this DB URL, which will be used for our production mode, is generator by mongo cloud atlas through the 'connect ->connect your application' feature on our cloud.mongodb dashboard. 
    secret: secretKey, // see above for this
    touchAfter: 24*60*60 // this will make sure the data isn't continuously updated everytime a user refresher the page. We only make updates if something has changed. Here, we're only updating every 24 hours. UNlike session config, this is in seconds, not ms.
});

store.on("error",function(e){
    console.log("STORE ERROR:",e)
})

const sessionConfig = {
    store:store, // this is used in production to make sure our sessions are stored on mongo DB (see above)
    name: 'mySession', // note, the default cookie name for the user's session ID is connect.sid (or something similar). We don't want to use a generic default, because it makes it easier for hackers to search for that cookie, extract it and log in as the user. For an extra layer of secruity, we've changed the default session cookie name here. Instead of mySession, we can use anything.
    secret: secretKey, // see above for this
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,// extra layer of secruity
        //secure:true, // this will mean that the cookie only works over https (not local host). Because lcoal host is not HTTPS, we don't add this until after development has finished and we're ready to deploy.
        expires:Date.now() + (1000 * 60 * 60 * 24 * 7), // this is in miliseconds (unlike mongoseDBstore above, which is in seconds)
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); // this should always be AFTER app.use(session(sessionConfig))
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;// this will give us access to the current user in all templates, so we can see if someone is loggedin and change our page accordingly.
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    res.locals.update = req.flash('update')
    res.locals.remove = req.flash('remove')
    next();
})

// -------------------- REQUIRE ROUTES HANDLERS --------------------

const bathroomRoutes = require('./routes/bathroomRoutes'); // here, we're importing our bathroom routes in the routes folder.
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/bathrooms',bathroomRoutes);
app.use('/bathrooms/:id/reviews',reviewRoutes);
app.use('/', userRoutes);


// -------------------- EJS ENGINE SETUP --------------------

app.engine('ejs', ejsMateEngine)
app.set('views', path.join(__dirname, '/views')); // this, along with the 'require path' code above, will allow us to run code in a director different from where the 'views' folder is saved. It's not 100% necessary becuase we usually always work in the views folder, but it is best practice.
app.set('view engine','ejs'); // for  ejs to work, it needs to be saved in a folder within the project folder called 'views'. we then need to create a file called 'home.ejs'


// -------------------- LISTENING --------------------

const port = process.env.PORT || 3000; // we'll use 3000 for local development and for production we'll use the heorku port
app.listen(port,function(){
    console.log(`listening on port ${port}`); // test by running 'nodemon index.js' in the terminal
});

// -------------------- MONGOOSE DB CONNECTION----------------

mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true}) // this will work with the db called 'wheresthebathroomdb'. if it doesn't exist, it will be automatically created for us.
    .then(function(){
        console.log("Mongo Connection Open"); // we can test this the same way we test the listrning, with nodemon in the terminal
    })
    .catch(function(err){
        console.log("Oh no, Mongo Connection Error");
        console.log(err);
    });

// --------------------  VALIDATION SCHEMAS ---------------------

const extraValidatationBathroom = function(req,res,next){ // This will be used as an extra layer of validation, to ensure that the client doesn't use postman to sneak past our existing validation and submit invalid data to our server.
    // if(!req.body.bathroom) throw new AppExpressError('Invalid Bathroom Data',400); // this will prevent the client from using postman to bypass our client side validation and upload data to our website that is invalid. However, we can remove it and use Joi instead, to save us saving to write this code for every field that we upload
    const bathroomSchema = Joi.object({ // this replaces the code on the line above to prevent the client from using postman to bypass our client side validation and upload data to our website that is invalid
        bathroom: Joi.object({ // note, if we leave something off here (e.g. no address) that's on our form, we'll get an error
            name:Joi.string().required(),
            address: Joi.string().required(),
            image: Joi.string(),
            description: Joi.string(),
            price: Joi.number()//.required()//.min(0)
        }).required()
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

const extraValidationReview = function(req,res,next){
    const reviewSchema = Joi.object({
        review: Joi.object({
            rating: Joi.number().required().min(1).max(5),
            body: Joi.string().required(),
            image: Joi.string(),
            user: Joi.string(),
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

// --------------------  GET HOME PAGE ---------------------

app.get('/', function(req,res){
    //res.send("Where's the Bathroom?");
    res.render('home.ejs');        
});
// --------------------  ERROR HANDLING ------------------- 

app.use(function(err,req,res,next){
    res.render("error.ejs",{err})
})

app.all('*',function(req,res,next){ // because we have the *, this will run if we do to any url that doesn't exist.
   res.render("error2.ejs")
})

// app.use(function(err,req,res,next){
//     const{statusCode=500,message="something went wrong"} = err; // setting default to 500 and message default to "something went wrong"
//     res.status(statusCode).send(message)
// })

app.use(function(err,req,res,next){
    res.render("error3.ejs",{err})
})