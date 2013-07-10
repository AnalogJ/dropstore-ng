'use strict';


// Declare app level module which depends on filters, and services
angular.module('testApp', ['testApp.controllers', 'testApp.services', 'dropstore-ng']).
    config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $routeProvider.when('/', {templateUrl: '/test.html', controller: 'pageTestCtrl', reloadOnSearch:false});
        $routeProvider.otherwise({redirectTo: '/'});
        $locationProvider.html5Mode(true).hashPrefix('!');
    }]);