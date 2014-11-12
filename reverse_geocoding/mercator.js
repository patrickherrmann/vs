var tau = 6.2831853071;

function mercator(point) {
    var lng = point[0];
    var lat = point[1];

    lat = (360 / tau) * Math.log(Math.tan(lat / 180 * (tau / 4) + (tau / 8)));

    return [lng, lat];
}

module.exports = mercator;