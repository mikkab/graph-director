'use strict';

angular.module('graphDirectorApp')
  .controller('TopCtrl', function ($scope, $http) {

    $http.get('/api/directors/top').success(function(names) {
      $scope.names = names;
    });
  });
