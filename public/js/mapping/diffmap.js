var gradient = createGradient([
    one.color('#f40'),
    one.color('#ccc'),
    one.color('#04f')
]);

function createColoration(as, bs, k) {
    return function(counties) {

        var max = null;
        var mapping = {};

        $.each(counties, function(i, county) {
            var a = as[county.id];
            if (!a) a = 0;

            var b = bs[county.id];
            if (!b) b = 0;

            var diff = b - a;
            var magn = Math.abs(diff);

            if (!max || magn > max) {
                max = magn;
            }

            mapping[county.id] = diff;
        });

        return function(id) {
            var v = mapping[id];
            v = v / max;
            var magn = Math.abs(v);
            var sign = v < 0 ? -1 : 1;
            v = sign * Math.pow(magn, k);
            v = v * 0.5 + 0.5;
            return gradient(v).hex();
        }
    };
}

function drawMap(coloration) {
    var canvas = $('#map-canvas')[0];
    var map = new CountyMap(canvas, function() {
        map.draw({
            countyStroke: '#aaa'
        }, coloration);
    });
}

$(function() {
    $.get('/api/collections/548656d4003cac2766e962c6/counties', function(as) {
        $.get('/api/collections/5486459bc90d6a0b61f9359b/counties', function(bs) {
            drawMap(createColoration(as, bs, 0.3));
        });
    });
});