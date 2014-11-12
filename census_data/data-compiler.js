var counties = require("./counties-geojson.json");
var population = require("./county-populations.json");
var mercator = require('../reverse_geocoding/mercator');
var _ = require('underscore');

var features = counties.features;

function project(polygon) {
    // Ignore holes and remove redundant duplicate coordinate
    polygon[0].pop();
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