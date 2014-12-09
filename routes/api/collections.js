var express = require('express');
var router = express.Router();
var collectors = require('../../twitter/collectors');
var _ = require('underscore');
var mongoose = require('mongoose');
var Collection = require('../../models/Collection');
var Tweet = require('../../models/Tweet');
var ObjectId = mongoose.Types.ObjectId;
var async = require('async');

function handleError(res, callback) {
    return function(err, results) {
        if (err) {
            res.send(err);
        } else {
            callback(results);
        }
    };
}

function bindExec(query) {
    return query.exec.bind(query);
}

router.get('/', function(req, res) {

    var success = res.json.bind(res);

    Collection.find({}, handleError(res, success));
});

router.post('/', function(req, res) {

    var newCollection = new Collection(req.body);

    var success = function(results) {
        collectors.add(newCollection);
        res.send(newCollection);
    };

    newCollection.save(handleError(res, success));
});

router.get('/:id', function(req, res) {
    var id = req.params.id;

    var tasks = {
        info: bindExec(Collection.findById(id)),
        count: bindExec(Tweet.count({
            collection_id: ObjectId(id)
        }))
    };

    var success = function(results) {
        var obj = {};
        obj.name = results.info.name;
        obj.query = results.info.query;
        obj.count = results.count;
        res.json(obj);
    };

    async.parallel(tasks, handleError(res, success));
});

function createGeoJson(tweets) {
    return {
        type: "FeatureCollection",
        features: _.map(tweets, function(tweet) {
            return {
                type: "Feature",
                geometry: {
                    type: 'Point',
                    coordinates: [tweet.lng, tweet.lat]
                },
                properties: {
                    text: tweet.text,
                    username: tweet.username,
                    created_at: tweet.created_at,
                    id_str: tweet.id_str
                }
            };
        })
    }
}

router.get('/:id/geojson', function(req, res) {

    var success = _.compose(res.json.bind(res), createGeoJson);

    Tweet.find({
        collection_id: ObjectId(req.params.id)
    }, handleError(res, success));
});

function createCountyLookup(counties) {
    var lookup = {};

    _.each(counties, function(county) {
        lookup[county._id] = county.count;
    });

    return lookup;
}

router.get('/:id/counties', function(req, res) {

    var success = _.compose(res.json.bind(res), createCountyLookup);

    Tweet.aggregate([{
        $match: {
            collection_id: ObjectId(req.params.id)
        }
    }, {
        $group: {
            _id: '$county_id',
            count: {
                $sum: 1
            }
        }
    }], handleError(res, success));
});

router.put('/:id', function(req, res) {

    var success = function() {
        res.json({
            message: 'Updated collection'
        });
    };

    Collection.findByIdAndUpdate(req.params.id, req.body, handleError(res, success));
});

router.delete('/:id', function(req, res) {

    var tasks = {
        removeTweets: bindExec(Tweet.remove({
            collection_id: ObjectId(req.params.id)
        })),
        removeCollection: bindExec(Collection.findByIdAndRemove(req.params.id))
    };

    var success = function(results) {
        res.json({
            message: 'Deleted collection'
        });
    };

    async.series(tasks, handleError(res, success));
});

module.exports = router;