var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    title: String,
    first_coll_id: mongoose.Schema.Types.ObjectId,
    second_coll_id: mongoose.Schema.Types.ObjectId
});

module.exports = mongoose.model('vs', schema);