var express = require('express');
var collectors = require('../../twitter/collectors');
var _ = require('underscore');
var mongoose = require('mongoose');
var Collection = require('../../models/Collection');
var Tweet = require('../../models/Tweet');
var ObjectId = mongoose.Types.ObjectId;
var async = require('async');
var extend = require('node.extend');

var router = express.Router();

function handle(success, failure) {
    return function(err, results) {
        if (err) {
            failure(err);
        } else {
            success(results);
        }
    };
}

function unknownError(res) {
    return function(err) {
        console.err(err);
        res.json({
            error: 'An unknown error occurred'
        });
    };
}

function notFound(res) {
    res.status(404).send('Collection not found');
}

function bindExec(query) {
    return query.exec.bind(query);
}

router.get('/', function(req, res) {

    var success = res.json.bind(res);

    Collection.find({}, handle(success, unknownError(res)));
});

router.post('/', function(req, res) {

    var newCollection = new Collection(req.body);

    var success = function() {
        collectors.add(newCollection);
        res.send(newCollection);
    };

    newCollection.save(handle(success, unknownError(res)));
});

router.get('/:id', function(req, res) {
    var id = req.params.id;

    var queries = {
        coll: Collection.findById(id),
        stats: Tweet.aggregate([{
            $match: {
                collection_id: ObjectId(id)
            }
        }, {
            $sort: {
                created_at: 1
            }
        }, {
            $group: {
                _id: null,
                from: {
                    $first: "$created_at"
                },
                to: {
                    $last: "$created_at"
                },
                count: {
                    $sum: 1
                }
            }
        }])
    };

    var tasks = {};
    _.each(queries, function(v, k) {
        tasks[k] = bindExec(v);
    });

    var success = function(results) {

        if (!results.coll) {
            notFound(res);
            return;
        }

        var stats = results.stats[0];

        res.json({
            _id: results.coll._id,
            name: results.coll.name,
            query: results.coll.query,
            count: stats.count,
            from: stats.from,
            to: stats.to
        });
    };

    async.series(tasks, handle(success, unknownError(res)));
});

function createGeoJsonFeature(tweet) {
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
}

function createGeoJson(tweets) {
    return {
        type: "FeatureCollection",
        features: _.map(tweets, createGeoJsonFeature)
    };
}

router.get('/:id/geojson', function(req, res) {

    var success = _.compose(res.json.bind(res), createGeoJson);

    Tweet.find({
        collection_id: ObjectId(req.params.id)
    }, handle(success, unknownError(res)));
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
    }], handle(success, unknownError(res)));
});

router.put('/:id', function(req, res) {

    var success = res.json.bind(res);

    Collection.findByIdAndUpdate(req.params.id, req.body, handle(success, unknownError(res)));
});

router.delete('/:id', function(req, res) {

    var tasks = {
        removeTweets: bindExec(Tweet.remove({
            collection_id: ObjectId(req.params.id)
        })),
        removeCollection: bindExec(Collection.findByIdAndRemove(req.params.id))
    };

    var success = function() {
        res.json({
            message: 'Deleted collection'
        });
    };

    async.series(tasks, handle(success, unknownError(res)));
});

module.exports = router;