'use strict';

angular.module('graphDirectorApp')
  .controller('NavbarCtrl', function ($scope, $location) {
    $scope.menu = [{
      'title': 'Home',
      'link': '/main'
    }, {
      'title': 'Top',
      'link': '/top'
    }, {
      'title': 'About',
      'link': '/about'
    }
    ];

    $scope.isCollapsed = true;

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });
