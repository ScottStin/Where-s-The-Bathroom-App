const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    body:{
        type:String,
    },
    image:{
        type:String
    },
    rating:{
        type:Number,
        min:0,
        max:5,
        required:true
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
})

module.exports = mongoose.model("Review",reviewSchema)