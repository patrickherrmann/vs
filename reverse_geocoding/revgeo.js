var pip = require('point-in-polygon');
var mercator = require('./mercator');
var counties = require('../public/counties.json');
var _ = require('underscore');

function boxContains(coord, bb) {
    return coord[0] > bb[0][0] &&
        coord[0] < bb[1][0] &&
        coord[1] > bb[0][1] &&
        coord[0] < bb[1][1];
}

function getCounty(coord) {
    var projected = mercator(coord);

    var match = _.find(counties, function(county) {
        return _.any(county.polygons, function(polygon) {
            return boxContains(projected, polygon.box) &&
                pip(projected, polygon.exact);
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