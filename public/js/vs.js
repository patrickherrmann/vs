var vs = angular.module('vs', [
    'ngRoute',
    'vsControllers'
]);

vs.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/collections', {
            templateUrl: 'partials/collections.html',
            controller: 'CollectionListCtrl'
        })
        .when('/collections/:collectionId', {
            templateUrl: 'partials/collection-view.html',
            controller: 'CollectionDetailCtrl'
        })
        .when('/vs', {
            templateUrl: 'partials/vs.html',
            controller: 'VsCtrl'
        })
        .otherwise({
            redirectTo: '/vs'
        });
}]);
