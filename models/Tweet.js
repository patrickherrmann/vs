var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    text: String,
    username: String,
    lat: Number,
    lng: Number,
    created_at: Date,
    id_str: String,
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
    id_str: 1,
    collection_id: 1
}, {
    unique: true
});

schema.index({
    created_at: 1
});

module.exports = mongoose.model('tweets', schema);
