var counties = require("./counties-geojson.json");
var population = require("./county-populations.json");
var _ = require('underscore');

var features = counties.features;

var tau = 6.2831853071;

function mercator(point) {
    var lng = point[0];
    var lat = point[1];

    lat = (360 / tau) * Math.log(Math.tan(lat / 180 * (tau / 4) + (tau / 8)));

    return [lng, lat];
}

function project(polygon) {
    // Ignore holes
    return _.map(polygon[0], function(coord) {
        return mercator(coord);
    });
}

function mapGeometry(geometry) {
    if (geometry.type == "MultiPolygon") {
        return _.map(geometry.coordinates, project);
    } else if (geometry.type == "Polygon") {
        return [project(geometry.coordinates)];
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
        polygons: mapGeometry(feat.geometry)
    });
}

_.each(features, saveFeature);

console.log(JSON.stringify(info));