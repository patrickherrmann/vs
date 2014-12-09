var express = require('express');
var router = express.Router();
var collectors = require('../../twitter/collectors');
var _ = require('underscore');
var mongoose = require('mongoose');
var Collection = require('../../models/Collection');
var Tweet = require('../../models/Tweet');
var ObjectId = mongoose.Types.ObjectId;

router.get('/', function(req, res) {
    Collection.find({}, function(err, docs) {

        if (err) {
            res.send(err);
        } else {
            res.json(docs);
        }
    });
});

router.post('/', function(req, res) {
    var newCollection = new Collection(req.body);
    newCollection.save(function(err) {
        if (err) {
            res.send(err);
        } else {
            collectors.add(newCollection);
            res.send(newCollection);
        }
    });
});



router.get('/:id', function(req, res) {
    Collection.findById(req.params.id, function(err, doc) {
        if (err) {
            res.send(err);
        } else {
            res.json(doc);
        }
    });
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
    Tweet.find({
        collection_id: ObjectId(req.params.id)
    }, function(err, tweets) {
        if (err) {
            res.send(err);
        } else {
            res.json(createGeoJson(tweets));
        }
    });
});

router.get('/:id/geochart', function(req, res) {
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
    }], function(err, counties) {
        if (err) {
            res.send(err);
        } else {
            res.json(counties);
        }
    });
});

router.put('/:id', function(req, res) {
    Collection.findByIdAndUpdate(req.params.id, req.body, function(err) {
        if (err) {
            res.send(err);
        } else {
            res.json({
                message: 'Updated collection'
            });
        }
    });
});

router.delete('/:id', function(req, res) {
    Tweet.remove({
        collection_id: ObjectId(req.params.id)
    }, function(err) {
        if (err) {
            res.send(err);
        } else {
            Collection.findByIdAndRemove(req.params.id, function(err) {
                if (err) {
                    res.send(err);
                } else {
                    res.json({
                        message: 'Deleted collection'
                    });
                }
            });
        }
    });
});

module.exports = router;