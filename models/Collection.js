var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: String,
    query: String
});

module.exports = mongoose.model('collections', schema);