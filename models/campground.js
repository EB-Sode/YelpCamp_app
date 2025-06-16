const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Review = require('./review')

// Set campground schema for order
const CampgroundSchema = new Schema ({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

// Middleware to delete campgrounds and reviews within.
CampgroundSchema.post('findOneAndDelete', async function (doc){
    if(doc) {
        await Review.deleteMany({
            _id: {
                $in:doc.reviews
            }
        })
    }
})

// export module to be imported by app
module.exports = mongoose.model("campground", CampgroundSchema);
