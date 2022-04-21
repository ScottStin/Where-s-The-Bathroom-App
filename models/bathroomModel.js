const mongoose = require('mongoose');
const Review = require('./reviewModel') // here, we're getting the product model so we can delete th child products when we delete the parent farm

const ImageSchema = new mongoose.Schema({ // here, we're defining the images uploaded to a bathroom as a new schema and nesting it in our other schema. However, we won't create a new model just for images. We're doing this so we can assign a virtual property (in this case, a thumbnail size image) to our images, and we can only add a virtual property to a schema
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200,h_200,c_thumb') // here, we're changing our cloudinary url to get a 200 width/width thumbail. This means that, whenever possible we can display a smaller tyhumbnail rather than loading the whole image.
}); // we'll save this thumbnail as a virtual 

const BathroomSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    geometry:{
        type:{
            type: String,
            enum: ['Point'],
            required:true
        },
        coordinates:{
            type: [Number],
            required:true
        }
    },
    images:[ImageSchema],
    address:{
        type:String,
        required:true
    },
    facilityType:{
        type:String,
        enum:['Airport','Beach','Bus station','Camping ground','Car park','Caravan park','Cemetery','Community building','Food outlet','Jetty','Other','Park or reserve','Rest area','Service station','Shopping centre','Sporting facility','Swimming pool','Train station','Resturtant, bar or cafe','Gym']
    },
    services:{
        type: Array,
        //emum:['Free On-site Parking', 'Adult Changerooms','Showers','Baby Change Facilities','Baby Care Room','Unisex','Disabled Bathrooms','Drinking Water','Sharps Disposal','Key Required']
    },
    description:{
        type:String,
    },
    price:{
        type: Number,
        min: 0
    },
    private:{
        type: String,
        lowercase:true,
        enum: ['private', 'public']
    },
    rating:{
        type: Number,
        min: 0,
        max:10
    },
    openinghours:{
        type: String
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[
        {
            type: mongoose.Schema.Types.ObjectId, // this is refering to the reviewModel Schema. This links the child to the parent. For this app, we won't go the other way and link the parent to the child. However, we could just be putting a similar code into the reviewModel.js file
            ref: 'Review'
        }
    ]
}, {toJSON:{virtuals:true}}); // mongoose virtuals, by default, will not be part of the results object when you convert an object ot json. So we have to do this to make our virtuals work if we want the output to be JSON (as is the case with our stringified bathroom virtual for mapbox below)

BathroomSchema.virtual('properties.popUpMarkup').get(function(){ // just like our imagescheme, we're using this to export some information in a particular format. We're not create a new model, we're just exporting the bathroom data in the format required by mapbox. This will inturn be used to create a link to our show page when we click on a mappoint
    return `<strong><a href="/bathrooms/${this._id}">${this.name}</a><strong><p>${this.description.substring(0,100)}...</p>` 
}); // we'll save this  as a virtual 


BathroomSchema.post('findOneAndDelete', async function(bathroom){ // this is NOT a post request. Here, post refers to middleware that runs after (post) another request. In this case, this will run after our farms delete request in our index.js file
    if(bathroom.reviews.length!=0){
        const removed = await Review.deleteMany({_id:{$in: bathroom.reviews}})
        console.log(removed)
    }
    //console.log("POST MIDDLEWARE!!")
    //console.log(farm)
})

module.exports = mongoose.model('Bathroom', BathroomSchema);; // now we can export this model and import it somewhere else

//https://res.cloudinary.com/dkny57jpp/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_red,b_rgb:262c35/v1649768178/Where%27s%20The%20Bathroom%20App/lviwywc7oijfle9bjyvh.jpg