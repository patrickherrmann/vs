var vsControllers = angular.module('vsControllers', []);

vsControllers.controller('CollectionListCtrl', ['$scope', '$http', function($scope, $http) {
    $http.get('/api/collections').success(function(data) {
        $scope.collections = data;
    });

    $scope.createNewCollection = function() {
        var body = {
            name: $scope.newCollectionName,
            query: $scope.newCollectionName
        };

        $http.post('/api/collections', body).success(function(data) {
            $scope.collections = data;
            $scope.newCollectionName = '';
        });
    };
}]);

vsControllers.controller('CollectionDetailCtrl', ['$scope', '$http', '$routeParams', '$q', '$window', function($scope, $http, $routeParams, $q, $window) {

    var getDetails = $http.get('/api/collections/' + $routeParams.collectionId);
    getDetails.then(function(payload) {
        $scope.collection = payload.data;
        drawBrowseMap();
    });

    var getCounties = $http.get('/api/collections/' + $routeParams.collectionId + '/counties');

    getCounties.then(function(payload) {
        $scope.counties = payload.data;
    });

    $scope.contrast = 0.6;

    var initMap = $q.defer();

    var canvas = document.getElementById('per-capita-map');
    new CountyMap(canvas, function(map) {
        initMap.resolve(map);
    });

    initMap.promise.then(function(map) {
        $scope.map = map;
    });

    $q.all([getDetails, getCounties, initMap.promise]).then(function(results) {
        $scope.drawPerCapitaMap();
    });

    $scope.drawPerCapitaMap = function() {

        $scope.map.draw({}, function(counties) {
            var perCap = {};
            var max = 0;

            _.each(counties, function(county) {
                var n = $scope.counties[county.id] || 0;
                var pop = county.pop;
                var pc = n / pop;

                perCap[county.id] = pc;

                if (pc > max) {
                    max = pc;
                }
            });

            return function(county) {
                var pc = perCap[county];
                var v;
                if (max) {
                    v = pc / max;
                    v = Math.pow(v, $scope.contrast);
                    v = Math.pow(v, $scope.contrast);
                } else {
                    v = 0;
                }
                return one.color('#00c').saturation(v).hex();
            };
        });
    }

    function drawBrowseMap() {
        var mapDiv = document.getElementById('browse-map');

        var options = {
            zoom: 4,
            center: {
                lat: 39.683549,
                lng: -97.440123
            },
            panControl: false,
            zoomControl: false,
            streetViewControl: false
        };



        var map = new google.maps.Map(mapDiv, options);

        map.data.setStyle(function(feature) {
            return {
                icon: "https://maps.gstatic.com/intl/en_us/mapfiles/markers2/measle_blue.png",
                visible: true,
                clickable: true
            };
        });

        map.data.loadGeoJson('/api/collections/' + $scope.collection._id + '/geojson');

        map.data.addListener('mouseover', function(event) {
            var text = event.feature.getProperty('text');
            var username = event.feature.getProperty('username');

            var $infoBox = $('#info-box');
            $infoBox.find('.text').text(text);
            $infoBox.find('.username').text(username);
        });
    }

    $scope.deleting = false;

    $scope.startDeletion = function() {
        $scope.deleting = true;
    };

    $scope.cancelDeletion = function() {
        $scope.deleting = false;
    };

    $scope.reallyDelete = function() {
        $http.delete('/api/collections/' + $scope.collection._id).success(function(data) {
            $window.location.href = '/#/collections';
        });
    };
}]);

vsControllers.controller('VsCtrl', ['$scope', '$http', '$q', function($scope, $http, $q) {

    $scope.k = 0.3;

    var initMap = $q.defer();

    var canvas = document.getElementById('diff-map');
    new CountyMap(canvas, function(map) {
        initMap.resolve(map);
    });

    initMap.promise.then(function(map) {
        $scope.map = map;
    });

    function loadCounties(collection) {
        return $http.get('api/collections/' + collection._id + '/counties');
    }

    $http.get('api/collections').success(function(data) {
        $scope.collections = data;

        if (data.length < 2) {
            return;
        }

        $scope.left = $scope.collections[0];
        $scope.right = $scope.collections[1];

        var loadLeftCounties = loadCounties($scope.left);
        var loadRightCounties = loadCounties($scope.right);

        loadLeftCounties.then(function(payload) {
            $scope.leftCounties = payload.data;
        });

        loadRightCounties.then(function(payload) {
            $scope.rightCounties = payload.data;
        });

        $q.all([initMap.promise, loadLeftCounties, loadRightCounties]).then(function() {
            $scope.drawMap();
        })
    });

    var gradient = createGradient([
        one.color('#02f'),
        one.color('#ccc'),
        one.color('#f20')
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
                var v;

                if (max) {
                    v = mapping[id];
                    v = v / max;
                    var magn = Math.abs(v);
                    var sign = v < 0 ? -1 : 1;
                    v = sign * Math.pow(magn, k);
                    v = v * 0.5 + 0.5;
                } else {
                    v = 0.5;
                }

                return gradient(v).hex();
            };
        };
    }


    $scope.drawMap = function() {
        var coloration = createColoration($scope.leftCounties, $scope.rightCounties, $scope.k);
        $scope.map.draw({
            countyStroke: '#aaa'
        }, coloration);
    };

    $scope.changeLeft = function() {
        loadCounties($scope.left).success(function(data) {
            $scope.leftCounties = data;
            $scope.drawMap();
        });
    }

    $scope.changeRight = function() {
        loadCounties($scope.right).success(function(data) {
            $scope.rightCounties = data;
            $scope.drawMap();
        });
    }
}]);
