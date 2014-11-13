/*
 * A gradient is a function that takes a value
 * from the interval [0,1] and returns a color.
 */

function createGradient(colors) {
    return function(value) {

        if (value < 0) value = 0;
        if (value > 1) value = 1;

        if (colors.length == 2) {
            var r0 = colors[0].red();
            var g0 = colors[0].green();
            var b0 = colors[0].blue();
            var r1 = colors[1].red();
            var g1 = colors[1].green();
            var b1 = colors[1].blue();
            var dr = r1 - r0;
            var dg = g1 - g0;
            var db = b1 - b0;
            var r = r0 + value * dr;
            var g = g0 + value * dg;
            var b = b0 + value * db;
            return one.color(['RGB', r, g, b, 1]);
        } else {
            var fuzzyIndex = value * (colors.length - 1);
            var before = Math.floor(fuzzyIndex);
            var after = Math.ceil(fuzzyIndex);
            return createGradient([colors[before], colors[after]])(fuzzyIndex - before);
        }
    }
}

function heatMap(value) {
    return one.color('#e00')
        .hue(0.6 * (1 - value));
}

function createSaturationGradient(color) {
    return function(value) {
        return color
            .value(0.8 - 0.3 * value)
            .saturation(value);
    }
}