const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Set campground schema for order
const campgroundSchema = new Schema ({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String
});

// export module to be imported by app
module.exports = mongoose.model("campground", campgroundSchema);
