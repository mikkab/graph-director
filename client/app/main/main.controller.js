'use strict';

angular.module('graphDirectorApp')
  .controller('MainCtrl', function ($scope, $http, $location) {
    $http.get('/api/directors').success(function(directors) {

      $scope.name = '';
      $scope.directors = directors;

      $scope.submit = function() {
        console.log('submit' + $scope.name);
        $location.path('/chart/' + $scope.name);
      }
    });
  });
