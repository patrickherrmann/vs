var vs = angular.module('vs', []);

vs.controller('CollectionListCtrl', ['$scope', '$http', function($scope, $http) {
    $http.get('/api/collections')
        .success(function(data) {
            $scope.collections = data;
        });
}]);
