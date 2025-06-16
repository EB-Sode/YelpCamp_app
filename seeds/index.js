const mongoose = require('mongoose')
const Campground = require('../models/campground');
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers');



mongoose.connect('mongodb://localhost:27017/yelpCamp')
  .then ( () => {
    console.log('connected to mongoose')
})
.catch ( (err) => {
    console.log('error connecting', err)
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open',  function() {
    console.log('Database connected');
});

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
await Campground.deleteMany({})
    for (i=0; i<50; i++) {
    const random1000 = Math.floor(Math.random() * 1000)
    const price = Math.floor(Math.random()* 50 +10)
    const camp = new Campground({
        location: `${cities[random1000].city}, ${cities[random1000].state}`,
        title: `${sample(descriptors)} ${sample(places)}`,
        image: `https://picsum.photos/400?random=${Math.random()}`,
        description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Odit nobis laborum officia sed, cum, ut quaerat veniam sapiente similique quo minima, labore repellendus reiciendis. Similique omnis deserunt cum dignissimos aperiam.",
        price
    })
    await camp.save()
    }
}

seedDB().then (() => {
    mongoose.connection.close()
});