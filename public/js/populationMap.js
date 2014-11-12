function coloration(county, pop, area) {
    if (!pop || !area) {
        console.log(county);
    }
    var shade = (pop / area) / 40000;
    shade = Math.pow(shade, 0.25);
    return one.color('#e00')
        .hue(0.6 * (1 - shade))
        .hex();
}

$(function() {
    var canvas = $('#map-canvas')[0];
    var map = new CountyMap(canvas, function() {
        map.draw({}, coloration);
    });
});