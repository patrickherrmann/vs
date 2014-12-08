var twitter = require('twitter'),
    collector = require('./collector'),
    _ = require('underscore'),
    util = require('util'),
    Collection = require('./models/Collection'),
    Tweet = require('./models/Tweet');

var twit = new twitter({
    consumer_key: process.env.TWITTER_API_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_API_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_API_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_API_ACCESS_TOKEN_SECRET
});

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

    saveTweet({
        text: tweet.text,
        username: tweet.user.name,
        lat: lat,
        lng: lng,
        created_at: tweet.created_at,
        id_str: tweet.id_str,
        collection_id: collection._id
    });
}

function adjustCollectionRate() {
    var apiWindow = 15 * 60;
    var maxRequests = 170;

    var pollLength = (apiWindow / maxRequests) / collectors.length;

    _.each(collectors, function(c) {
        c.collection.pollLength = pollLength;
    });
}

function saveTweets(tweets, collection) {
    _.each(tweets, function(tweet) {
        processTweet(tweet, collection);
    });
}

function add(collection) {
    var c = new collector(twit, collection, saveTweets, handleError);
    c.start();
    collectors.push(c);
    adjustCollectionRate();
}

function start() {
    Collection.find(function(err, collections) {
        if (err) throw "Failed to find collections";
        _.each(collections, add);
    });
}

exports.add = add;
exports.start = start;
exports.collectors = collectors;