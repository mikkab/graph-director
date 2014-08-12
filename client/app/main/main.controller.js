'use strict';

angular.module('graphDirectorApp')
  .controller('MainCtrl', function ($scope, $http) {
    $scope.director = null;

    $http.get('/api/director/Quentin Tarantino').success(function(directors) {
      $scope.director = directors[0];
    });

  });
