var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    text: String,
    username: String,
    lat: Number,
    lng: Number,
    created_at: Date,
    id_str: {
        type: String,
        unique: true
    },
    collection_id: mongoose.Schema.Types.ObjectId,
    county_id: String,
    __v: {
        type: Number,
        select: false
    }
});

schema.index({
    collection_id: 1,
    county_id: 1
});

schema.index({
    created_at: 1
});

module.exports = mongoose.model('tweets', schema);