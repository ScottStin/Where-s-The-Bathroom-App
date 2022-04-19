// this file will be used to manually enter test or default data into our db, so that we do not have to use the mian index file.

// ----------- SET UP ----------

const Bathroom = require('../models/bathroomModel.js'); // this is getting the product model we exported from the model.js file. If this seeds.js file is in a sub folder, you'll need to navigate back by adding .. to the start of the address like this: require('../models/models.js');
const mongoose = require('mongoose') ;
const {name, facilityType, address} = require('./publicToiletsList.js');// here, we're importing our initial data that we'll seed into the db
const {seedImage} = require('./seedImages.js')

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = "pk.eyJ1Ijoic2NvdHRzdGluc29uIiwiYSI6ImNsMXc5M21maDA2aHIzbG85bjl0N3JlMWoifQ.3QrGDM_FGwDCCECU8zg7IA";
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

mongoose.connect('mongodb://localhost:27017/wheres-the-bathoom-DB', {useNewUrlParser: true, useUnifiedTopology: true}) 
    .then(function(){
        console.log("Mongo Connection Open") // we can test this the same way we test the listrning, with nodemon in the terminal
    })
    .catch(function(err){
        console.log("Oh no, Mongo Connection Error")
        console.log(err)
    })

// -------- DATA ENTRY --------

// here, we'll take data from the publicToiletsList.js file and put it into our DB.
// Let's start with the first 50 sites

const seedDB = async function (){
    await Bathroom.deleteMany({});
    for (let i = 0; i <500; i++){
        let randomNumber1 = Math.floor((Math.random()*(seedImage.length))+0);
        let randomNumber2 = Math.floor((Math.random()*(seedImage.length))+0);
        let randomNumber3 = Math.floor((Math.random()*(seedImage.length))+0);
        const geoData = await geocoder.forwardGeocode({
            query: address[i],//'Yosemite, CA',
            limit: 1
        }).send()
        console.log(geoData)   
        const b = new Bathroom({
            name:name[i],
            address:address[i],
            price:0,
            //geometry:geoData.body.features[0].geometry,
            geometry:{
                type:geoData.body.features[0].geometry.type,
                coordinates:geoData.body.features[0].geometry.coordinates
            },
            author:'624c83ff53764dec67c0368f',
            facilityType:facilityType[i],
            images: [
                {
                    url: seedImage[randomNumber1].url,
                    filename: seedImage[randomNumber1].filename
                },
                {
                    url: seedImage[randomNumber2].url,
                    filename: seedImage[randomNumber2].filename
                },
                {
                    url: seedImage[randomNumber3].url,
                    filename: seedImage[randomNumber3].filename
                }
            ],
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique illo, fugiat et ipsum consequatur quas unde labore minima nesciunt magnam veniam corrupti ullam quia, illum recusandae! Quo modi fugit animi!"
        });
        b.save().then(b=>{
            console.log(b)
            console.log(randomNumber1)
            console.log(seedImage.length)
        })
        .catch(e=>{
            console.log(e)
        })
    }    
}

seedDB();

//----------- EMPTYING ALL DATA IN DB ----------

// this will delete all existing data in the db.

// const seedDB = async function (){
//     await Bathroom.deleteMany({});    
// }

// ----------- ADDING TO DB ----------

// to run the file this entering the data into the server, stop the nodemon server and type 'node seeds.js' into the terminal after you have used one of the insert options below in this file (if seeds.js is in a sub folder, you will need to navigate to that subfolder first)
// then, go to the mongo server (exit node and type mongo into the command line) and type 'show dbs', then use 'use ...' to enter the db you want to. Then, type  'show collections' to see the collections, then type 'db.collectioName.find() to show all documents added to that collection


// ----- INSERT ONE DEMO 

// const p = new Product({
//     name: "Ruby Grapefruit",
//     price: 1.99,
//     cataegory: 'fruit and nuts'
// })
// p.save().then(p=>{
//     console.log(p)
// })
// .catch(e=>{
//     console.log(e)
// })

// ----- INSERT MANY  DEMO 

// const seedProducts = [
//     {
//         name: "avacado",
//         price: 1.99,
//         cataegory: 'fruit and nuts'
//     },
//     {
//         name: "chicken breast 1 kg",
//         price: 10,
//         cataegory: 'meat'
//     },
//     {
//         name: "brown rice 5 kg",
//         price: 1.99,
//         cataegory: 'rice, bred, grains and pasta'
//     },
//     {
//         name: "tuna 450g can",
//         price: 1.99,
//         cataegory: 'jar and canned food'
//     }
// ]
// Product.insertMany(seedProducts) // because we're using insert many, we don't need to save
// .then(res=>{
//     console.log(res)
// })
// .catch(e=>{
//     console.log(e)
// })
