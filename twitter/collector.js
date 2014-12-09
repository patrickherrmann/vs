var _ = require('underscore')
extend = require('node.extend');

function Collector(twitter, collection, tweetHandler, errorHandler) {

    var self = this;

    if (!collection.query) {
        throw "Cannot create a collector without a query";
    }

    var defaults = {
        pollLength: 30,
        searchParams: {
            count: 100,
            result_type: "recent",
            include_entities: false,
            since_id: '0'
        }
    };

    self.twit = twitter;
    self.collection = extend(true, {}, defaults, collection);
    self.tweetHandler = tweetHandler;
    self.errorHandler = errorHandler;
    self.running = false;

    self.start = function() {
        if (!self.running) {
            self.running = true;
            poll();
        }
    }

    self.stop = function() {
        self.running = false;
    }

    function poll() {
        if (self.running) {

            getTweets(function(data) {
                if (_.has(data, 'search_metadata') && _.has(data, 'statuses')) {
                    self.collection.searchParams.since_id = data.search_metadata.max_id_str;
                    self.tweetHandler(data.statuses, self.collection);
                } else {
                    self.errorHandler(data, self.collection);
                }
                _.delay(poll, self.collection.pollLength * 1000);
            });
        }
    }

    function getTweets(handleResponse) {
        self.twit.search(self.collection.query, self.collection.searchParams, handleResponse);
    }
}

module.exports = Collector;