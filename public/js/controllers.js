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
}]);
