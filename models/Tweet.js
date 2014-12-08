var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    text: String,
    username: String,
    lat: Number,
    lng: Number,
    created_at: Date,
    id_str: String,
    collection_id: mongoose.Schema.Types.ObjectId,
    county_id: String
});

schema.index({
    collection_id: 1,
    county_id: 1
});

module.exports = mongoose.model('tweets', schema);