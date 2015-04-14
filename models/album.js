// db link
var mongoose = require('mongoose');

// define the product model (fields and data types)
var AlbumSchema = new mongoose.Schema({
    title: String,
    artist: String,
    price: Number,
    label: String,
    notes: String,
    imgurl: String
});

// make the model public so other files can access it
module.exports = mongoose.model('Album', AlbumSchema);