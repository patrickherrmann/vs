var xs = require('./farmers-markets.json');
var revgeo = require('./reverse_geocoding/revgeo.js');
var _ = require('underscore');

var mapping = {};

_.each(xs, function(x) {
    var county = revgeo(x);
    if (mapping[county]) {
        mapping[county]++;
    } else {
        mapping[county] = 1;
    }
});

console.log(JSON.stringify(mapping));