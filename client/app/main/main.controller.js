'use strict';

angular.module('graphDirectorApp')
  .controller('MainCtrl', function ($scope, $http) {
    $scope.director = null;

    $http.get('/api/director/Quentin Tarantino').success(function(directors) {
      $scope.director = directors[0];

      $scope.config = {
        options: {
          chart: {
            type: 'scatter'
          },
          tooltip: {
              formatter: function () {
                return '<b>' + this.point.name + '</b><br>' +
                        'rating: ' + this.point.y + '<br>' +
                        'votes: ' + this.point.votes;
              }
          }
        },
        title: {
          text: $scope.director.name
        },
        xAxis: {
          title: {
            text: 'year'
          }
        },
        yAxis: {
          title: {
            text: 'IMDb rating'
          }
        },
        series: [{
          name: 'Ratings',
          data: _.map($scope.director.movies, function(movie) { return {x : movie.year, y : movie.rating, name : movie.name, votes: movie.votes}; }),
          showInLegend: false
        }],

        loading: false
      }
    });
  });
