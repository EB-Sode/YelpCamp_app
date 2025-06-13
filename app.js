const express = require('express');
const path = require('path');
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const Campground = require('./models/campground');
const methodOverride = require('method-override')
const appError = require('./appError')

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
app.post('/campgrounds', async (req, res) => {
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`)
})

// Request to get campground by ID
app.get('/campgrounds/:id', async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id)
    res.render('campground/show', {campground} )
});

// Get campground to edit
app.get('/campgrounds/:id/edit', async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render(`campground/edit`, { campground })
})
// Edit campground and redirect to  the particular campground
app.put('/campgrounds/:id', async (req, res) => {
   const {id} = req.params;
   const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
   res.redirect(`/campgrounds/${campground._id}`)
});

// Delete campground
app.delete('/campgrounds/:id', async(req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
});

//Listen on port
app.listen(port, () =>{
    console.log('listening on port 3000')
});