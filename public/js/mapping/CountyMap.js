function CountyMap(canvas, callback) {

    var self = this;
    var g = canvas.getContext('2d');
    var renderWidth = canvas.offsetWidth;
    var renderHeight = canvas.offsetHeight;
    var views;
    var counties;

    var defaultOptions = {
        backgroundFill: '#eee',
        backgroundStroke: '#ccc',
        countyStroke: null
    }

    function init() {

        var continentalUS = {
            renderBox: {
                hi: {
                    x: renderWidth,
                    y: renderHeight * 0.98
                },
                lo: {
                    x: 0,
                    y: 0
                }
            },
            boundingBox: {
                hi: {
                    lng: -66,
                    lat: 58
                },
                lo: {
                    lng: -126,
                    lat: 20
                }
            }
        };

        var alaska = {
            renderBox: {
                hi: {
                    x: renderWidth * 0.4,
                    y: renderHeight
                },
                lo: {
                    x: 0,
                    y: renderHeight * 0.68
                }
            },
            boundingBox: {
                hi: {
                    lng: -118,
                    lat: 100
                },
                lo: {
                    lng: -190,
                    lat: 59
                }
            }
        };

        var hawaii = {
            renderBox: {
                hi: {
                    x: renderWidth * 0.7,
                    y: renderHeight
                },
                lo: {
                    x: renderWidth * 0.4,
                    y: renderHeight * 0.75
                }
            },
            boundingBox: {
                hi: {
                    lng: -154.2339,
                    lat: 25.8708
                },
                lo: {
                    lng: -166.8634,
                    lat: 17.9887
                }
            }
        };

        views = [continentalUS, alaska, hawaii];

        $.each(views, function(i, view) {
            views[i].width = view.renderBox.hi.x - view.renderBox.lo.x;
            views[i].height = view.renderBox.hi.y - view.renderBox.lo.y;
            views[i].pixelWidth = (view.boundingBox.hi.lng - view.boundingBox.lo.lng) / views[i].width;
            views[i].pixelHeight = (view.boundingBox.hi.lat - view.boundingBox.lo.lat) / views[i].height;
        });

        if (counties) {
            callback();
        } else {
            $.get('/data/counties.json', function(countyData) {
                counties = countyData;
                callback();
            });
        }
    }

    function getPixel(view, coord) {
        // Coordinates are already mercator projection
        var lng = coord[0];
        var lat = coord[1];

        var dlng = lng - view.boundingBox.lo.lng;
        var dlat = lat - view.boundingBox.lo.lat;

        var lngPixels = dlng / view.pixelWidth;
        var latPixels = dlat / view.pixelHeight;

        return [view.renderBox.lo.x + lngPixels, view.renderBox.hi.y - latPixels];
    }

    function inView(view, bb) {
        var vbb = view.boundingBox;

        return bb[0][0] < vbb.hi.lng &&
            bb[1][0] > vbb.lo.lng &&
            bb[0][1] < vbb.hi.lat &&
            bb[1][1] > vbb.lo.lat;
    }

    function drawPolygon(view, polygon, fill, stroke) {
        g.beginPath();

        var pixel = getPixel(view, polygon[0]);
        g.moveTo(pixel[0], pixel[1]);

        for (var i = 1; i < polygon.length; i++) {
            pixel = getPixel(view, polygon[i]);
            g.lineTo(pixel[0], pixel[1]);
        }

        g.closePath();

        g.fillStyle = fill;
        g.fill();

        if (stroke) {
            g.strokeStyle = stroke;
            g.stroke();
        }
    }

    function drawCounties(options, coloration) {

        if (options.backgroundFill) {
            g.fillStyle = options.backgroundFill;
            g.fillRect(0, 0, renderWidth, renderHeight);
        }

        if (options.backgroundStroke) {
            g.strokeStyle = options.backgroundStroke;
            g.strokeRect(1, 1, renderWidth - 2, renderHeight - 2);
        }

        var colorFunction = coloration(counties);

        $.each(views, function(i, view) {
            $.each(counties, function(j, county) {
                $.each(county.polygons, function(k, polygon) {
                    if (inView(view, polygon.box)) {
                        drawPolygon(view, polygon.exact, colorFunction(county.id), options.countyStroke);
                    }
                });
            });
        });
    }

    self.draw = function(options, coloration) {
        options = $.extend({}, defaultOptions, options);
        drawCounties(options, coloration);
    }

    init();
}
