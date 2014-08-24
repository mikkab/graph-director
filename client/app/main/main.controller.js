'use strict';

angular.module('graphDirectorApp')
  .controller('MainCtrl', function ($scope, $http, $location) {
      $scope.name = '';
      $http.get('/api/directors').success(function(directors) {

      $scope.directors = directors;

      $scope.submit = function() {
        $location.path('/main/' + $scope.name);
      }
    });
  });
