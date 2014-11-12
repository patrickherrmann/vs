var pip = require('point-in-polygon');
var mercator = require('./mercator');
var counties = require('../public/counties.json');
var _ = require('underscore');

function getCounty(coord) {
    var projected = mercator(coord);

    var match = _.find(counties, function(county) {
        return _.any(county.polygons, function(polygon) {
            return pip(projected, polygon);
        });
    });

    if (match) {
        return match.id;
    } else {
        return null;
    }
}

var here = [-120.653805, 35.286586];

console.log(getCounty(here));

module.exports = getCounty;