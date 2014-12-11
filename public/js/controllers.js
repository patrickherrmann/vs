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

        $http.post('/api/collections/', body).success(function(data) {
            $scope.collections = data;
            $scope.newCollectionName = '';
        });
    };
}]);

vsControllers.controller('CollectionDetailCtrl', ['$scope', '$http', '$routeParams', '$q', '$window', function($scope, $http, $routeParams, $q, $window) {

    var getDetails = $http.get('/api/collections/' + $routeParams.collectionId);
    getDetails.then(function(payload) {
        $scope.collection = payload.data;
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
                var v = pc / max;
                v = Math.pow(v, $scope.contrast);
                return one.color('#00c').saturation(v).hex();
            };
        });
    }

    $scope.deleting = false;

    $scope.startDeletion = function() {
        $scope.deleting = true;
    };

    $scope.cancelDeletion = function() {
        $scope.deleting = false;
    }

    $scope.reallyDelete = function() {
        $http.delete('/api/collections/' + $scope.collection._id).success(function(data) {
            $window.location.href = '/#/collections';
        });
    };
}]);
