var counties = require("./counties-geojson.json");
var population = require("./county-populations.json");
var mercator = require('../reverse_geocoding/mercator');
var _ = require('underscore');

var features = counties.features;

function boundingBox(polygon) {

    var hi = [polygon[0][0], polygon[0][1]];
    var lo = [polygon[0][0], polygon[0][1]];

    _.each(polygon, function(point) {
        if (point[0] < lo[0]) lo[0] = point[0];
        if (point[1] < lo[1]) lo[1] = point[1];
        if (point[0] > hi[0]) hi[0] = point[0];
        if (point[1] > hi[1]) hi[1] = point[1];
    });

    return [lo, hi];
}

function format(polygon) {
    // Ignore holes and remove redundant duplicate coordinate
    polygon[0].pop();
    var projected = _.map(polygon[0], function(coord) {
        return mercator(coord);
    });

    return {
        exact: projected,
        box: boundingBox(projected)
    };
}

function formatGeometry(geometry) {
    if (geometry.type == "MultiPolygon") {
        return _.map(geometry.coordinates, format);
    } else if (geometry.type == "Polygon") {
        return [format(geometry.coordinates)];
    } else {
        console.error('Unknown geometry ' + geometry.type);
    }
}



var info = [];

function saveFeature(feat) {
    if (!population[feat.properties.GEO_ID]) return;
    info.push({
        id: feat.properties.GEO_ID,
        area: feat.properties.CENSUSAREA,
        pop: population[feat.properties.GEO_ID],
        polygons: formatGeometry(feat.geometry)
    });
}

_.each(features, saveFeature);

console.log(JSON.stringify(info));