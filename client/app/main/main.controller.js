'use strict';

angular.module('graphDirectorApp')
  .controller('MainCtrl', function ($scope, $http, $location) {
    $scope.name = '';

    $scope.submit = function() {
      console.log('submit' + $scope.name);
      $location.path('/chart/' + $scope.name);
    }
  });
