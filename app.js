const express = require('express');
const path = require('path');
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utility/ExpressError')
const Campground = require('./models/campground');
const Review = require('./models/review');
const methodOverride = require('method-override')
const catchAsync = require('./utility/catchAsync');
const { resourceUsage } = require('process');
const { campgroundSchema, reviewSchema} = require('./schema.js') // destructuring so I can import other schemas


// connet to mongoose
mongoose.connect('mongodb://localhost:27017/yelpCamp')
  .then ( () => {
    console.log('connected to mongoose')
})
.catch ( (err) => {
    console.log('error connecting', err)
});
// connect to database
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open',  function() {
    console.log('Database connected');
});

const app = express();
const port = 3000;

// middleware to enable parsing incoming request from URL and makes req.body accessible
app.use(express.urlencoded({extended:true}))

//middleware to enable http verbs where they are not supported
app.use(methodOverride('_method'))

//Joi middleware
const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if (error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 404)
    } else {
         next();
    }
}

const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 404)
    } else {
        next();
    }
}
app.engine('ejs', ejsMate)
// Check view engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Get request for home page
app.get('/', (req, res) => {
    res.render("home")
});

// get request for campground
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campground/index', { campgrounds })
});

// get request to input new campground
app.get('/campgrounds/new', (req, res) => {
    res.render('campground/new');
})
// post request for new campground 
app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
    const {error} = campgroundSchema.validate(req.body);
    if (error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 404)
    }
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`)
}))

// Request to get campground by ID
app.get('/campgrounds/:id', validateReview, catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id).populate('reviews')
    res.render('campground/show', {campground} )
}));

// Get campground to edit
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render(`campground/edit`, { campground })
}))
// Edit campground and redirect to  the particular campground
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
   const {id} = req.params;
   const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
   res.redirect(`/campgrounds/${campground._id}`)
}));

// Delete campground
app.delete('/campgrounds/:id', catchAsync(async(req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}));

//Display reviews
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review (req.body.review)
    campground.reviews.push(review);
    await review.save()
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}));

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}));


//Catch Errors in all routes
app.all(/.*/, (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})

app.use((err, req, res, next) => {
    const {statuscode=500, message} = err;
    if(!err.message) err.message = 'Something went wrong';
    res.status(statuscode).render('error', { err })
});

//Listen on port
app.listen(port, () => {
    console.log('listening on port 3000')
});