//var gradient = createSaturationGradient(one.color('#0f0'));
//var gradient = heatMap;
var gradient = createGradient([
    one.color('#f00'),
    one.color('#ccc'),
    one.color('#00f')
]);

function drawMap(coloration) {
    var canvas = $('#map-canvas')[0];
    var map = new CountyMap(canvas, function() {
        map.draw({
            countyStroke: '#aaa'
        }, coloration);
    });
}

$(function() {
    $.get('/walmarts.json', function(walmarts) {
        $.get('/farmers-markets.json', function(markets) {
            function coloration(counties) {

                var max = null;
                var mapping = {};

                $.each(counties, function(i, county) {
                    var ws = walmarts[county.id];
                    if (!ws) ws = 0;

                    var ms = markets[county.id];
                    if (!ms) ms = 0;

                    var diff = ms - ws;
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
                    v = sign * Math.pow(magn, 0.3);
                    v = v * 0.5 + 0.5;
                    return gradient(v).hex();
                }
            }

            drawMap(coloration);
        });
    });
});