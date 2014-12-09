var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    query: String
});

module.exports = mongoose.model('collections', schema);