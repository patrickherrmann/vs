function createGradient(colors) {

    return function(ratio) {

        if (ratio < 0) ratio = 0;
        if (ratio > 1) ratio = 1;

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
            var r = r0 + ratio * dr;
            var g = g0 + ratio * dg;
            var b = b0 + ratio * db;
            return one.color(['RGB', r, g, b, 1]);
        } else {
            var fuzzyIndex = ratio * (colors.length - 1);
            var before = Math.floor(fuzzyIndex);
            var after = Math.ceil(fuzzyIndex);
            return createGradient([colors[before], colors[after]])(fuzzyIndex - before);
        }
    }
}