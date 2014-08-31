'use strict';


var MIN_LENGTH_FOR_AUTOCOMPLETE = 2;

angular.module('graphDirectorApp')
  .controller('MainCtrl', function ($scope, $http, $location) {
    $http.get('/api/directors').success(function(directors) {
      $scope.name = '';

      $scope.submit = function() {
        $location.path('/main/' + $scope.name);
      }

      $scope.typed = function(text) {
        if (text.length < MIN_LENGTH_FOR_AUTOCOMPLETE) {
          $scope.directors = [];
        } else if (text.length == MIN_LENGTH_FOR_AUTOCOMPLETE) {
          $scope.directors = directors;
        }
      };
    });
  });
