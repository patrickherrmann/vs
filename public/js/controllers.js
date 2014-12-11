var vsControllers = angular.module('vsControllers', []);

vsControllers.controller('CollectionListCtrl', ['$scope', '$http', function($scope, $http) {
    $http.get('/api/collections').success(function(data) {
        $scope.collections = data;
    });
}]);

vsControllers.controller('CollectionDetailCtrl', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {

    $http.get('/api/collections/' + $routeParams.collectionId).success(function(data) {
        $scope.collection = data;
    });

    $http.get('/api/collections/' + $routeParams.collectionId + '/counties').success(function(data) {
        $scope.counties = data;
        $scope.contrast = 0.6;
        drawPerCapitaMap();
    });

    function drawPerCapitaMap() {
        var canvas = document.getElementById('per-capita-map');
        new CountyMap(canvas, function(map) {
            map.draw({}, function(counties) {
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
        });
    }


}]);
