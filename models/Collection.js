var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    query: String,
    __v: {
        type: Number,
        select: false
    }
});

module.exports = mongoose.model('collections', schema);