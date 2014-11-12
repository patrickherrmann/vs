var pip = require('point-in-polygon');
var mercator = require('./mercator');
var counties = require('../public/counties.json');
var _ = require('underscore');

var capacity = 3;

function boxContains(coord, bb) {
    return coord[0] > bb[0][0] &&
        coord[0] < bb[1][0] &&
        coord[1] > bb[0][1] &&
        coord[0] < bb[1][1];
}

function quadTree(center, halfDim) {
    var self = this;

    self.center = center;
    self.halfDim = halfDim;

    // members
    self.polygons = [];

    // children
    self.nw = null;
    self.ne = null;
    self.se = null;
    self.sw = null;

    function intersects(bb) {
        return bb[0][0] < center[0] + self.halfDim &&
            bb[1][0] > center[0] - self.halfDim &&
            bb[0][1] < center[1] + self.halfDim &&
            bb[1][1] > center[1] - self.halfDim;
    }

    function contains(coord) {
        return coord[0] < center[0] + self.halfDim &&
            coord[0] > center[0] - self.halfDim &&
            coord[1] < center[1] + self.halfDim &&
            coord[1] > center[1] - self.halfDim;
    }

    function subdivide() {
        var subDim = self.halfDim / 2;
        self.nw = new quadTree([center[0] - subDim, center[1] + subDim], subDim);
        self.ne = new quadTree([center[0] + subDim, center[1] + subDim], subDim);
        self.se = new quadTree([center[0] + subDim, center[1] - subDim], subDim);
        self.sw = new quadTree([center[0] - subDim, center[1] - subDim], subDim);
    }

    self.insert = function(polygon) {

        if (!intersects(polygon.box)) {
            return false;
        }

        if (self.polygons.length < capacity) {
            self.polygons.push(polygon);
            return true;
        }

        if (self.nw == null) {
            subdivide();
        }

        var inserted = false;

        if (self.nw.insert(polygon)) inserted = true;
        if (self.ne.insert(polygon)) inserted = true;
        if (self.se.insert(polygon)) inserted = true;
        if (self.sw.insert(polygon)) inserted = true;

        return inserted;
    }

    self.retrieve = function(coord) {

        if (!contains(coord)) {
            return null;
        }

        var match = _.find(self.polygons, function(polygon) {
            return boxContains(coord, polygon.box) &&
                pip(coord, polygon.exact);
        });

        if (match) {
            return match.id;
        }

        if (!self.nw) {
            return null;
        }

        if (match = self.nw.retrieve(coord)) return match;
        if (match = self.ne.retrieve(coord)) return match;
        if (match = self.se.retrieve(coord)) return match;
        if (match = self.sw.retrieve(coord)) return match;

        return null;
    }
}

var qtree = new quadTree([0, 0], 180);

_.each(counties, function(county) {
    _.each(county.polygons, function(polygon) {
        var obj = _.extend({}, polygon, {
            id: county.id
        });
        qtree.insert(obj);
    });
});

module.exports = _.compose(qtree.retrieve, mercator);