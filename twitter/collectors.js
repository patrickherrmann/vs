var twitter = require('twitter'),
    collector = require('./collector'),
    _ = require('underscore'),
    util = require('util'),
    Collection = require('../models/Collection'),
    Tweet = require('../models/Tweet'),
    revgeo = require('../reverse_geocoding/revgeo.js');

var twit = new twitter({
    consumer_key: process.env.TWITTER_API_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_API_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_API_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_API_ACCESS_TOKEN_SECRET
});

var apiWindow = 15 * 60;
var maxRequests = 170;
var collectors = [];

var handleError = _.compose(console.error, util.inspect);

function saveTweet(obj) {
    var tweet = new Tweet(obj);
    tweet.save(function(err, data) {
        if (err) {
            handleError(err);
        }
    });
}

function processTweet(tweet, collection) {

    if (!tweet.coordinates) return;

    var loc = tweet.coordinates.coordinates;
    var lat = loc[1],
        lng = loc[0];

    var county_id = revgeo(loc);

    if (county_id) {
        saveTweet({
            text: tweet.text,
            username: tweet.user.name,
            lat: lat,
            lng: lng,
            created_at: tweet.created_at,
            id_str: tweet.id_str,
            collection_id: collection._id,
            county_id: county_id
        });
    }
}

function adjustCollectionRate() {

    var pollLength = (apiWindow / maxRequests) * collectors.length;

    console.log('Poll length: ' + pollLength);

    _.each(collectors, function(c) {
        c.collection.pollLength = pollLength;
    });
}

function saveTweets(tweets, collection) {
    _.each(tweets, function(tweet) {
        processTweet(tweet, collection);
    });
}

function add(collection, delay) {
    var c = new collector(twit, collection, saveTweets, handleError);
    setTimeout(function() {
        c.start();
    }, delay || 0);
    collectors.push(c);
    adjustCollectionRate();
}

function remove(id) {
    var coll = _.find(collectors, function(c) {
        return c.collection._id == id;
    });
    if (!coll) return;
    coll.stop();

    collectors = _.filter(collectors, function(c) {
        return c.collection._id != id;
    });

    adjustCollectionRate();
}

function start() {
    Collection.find(function(err, collections) {
        if (err) throw "Failed to find collections";

        var pollLength = (apiWindow / maxRequests) * collections.length;

        _.each(collections, function(collection, i) {
            add(collection, i * pollLength * 1000);
        });
    });
}

exports.add = add;
exports.start = start;
exports.remove = remove;
exports.collectors = collectors;
