'use strict';


angular.module('graphDirectorApp')
  .controller('ChartCtrl',['$scope', '$http', '$stateParams', '$q', function ($scope, $http, $stateParams, $q) {

    $scope.director = null;
    $scope.new_director = ''

    $http.get('/api/director/' + $stateParams.name).success(function(directors) {
      var director = directors[0];
      if (!director)
        return;
      var movies = director.movies;
      director.total_votes = _.reduce(movies, function(votes, movie) { return votes + movie.votes; }, 0);
      director.avg_rating = _.reduce(movies, function(total, movie) { return total + movie.rating * movie.votes; }, 0) / director.total_votes; 

      $scope.config = {
        options: {
          chart: {
            type: 'scatter'
          },
          tooltip: {
            formatter: function () {
              return '<b>' + this.point.name + '</b><br>' +
                'rating: ' + this.point.y + '<br>' +
                'votes: ' + this.point.votes + '<br>' +
                '{<a href="' + this.point.imdbUrl + '">imdb</a>}    {<a href="' + this.point.amazonUrl + '">amazon</a>}'
            }
          }
        },
        title: {
          text: director.name
        },
        xAxis: {
          allowDecimals: false,
          title: {
            text: 'year'
          },
          minPadding: 0.03,
          maxPadding: 0.03

        },
        yAxis: {
          title: {
            text: 'IMDb rating'
          },
          minPadding: 0.12,
          maxPadding: 0.04
        },
        series: [{
          name: 'Ratings',
          data: _.map(movies, function(movie) { 

            return {
              x : movie.year, 
              y : movie.rating, 
              name : movie.name, 
              imdbUrl : 'http://www.imdb.com/title/' + movie.imdbId,
              amazonUrl : 'http://www.amazon.com/s/?url=search-alias%3Ddvd&field-keywords=' + movie.name,
              votes: $scope.numberWithCommas(movie.votes), 
              marker : { 
                symbol: 'url(http://ia.media-imdb.com/images/M/' + movie.poster + '._V1_SX75.jpg)'
              }
            }; 
          }),
          showInLegend: false
        }],
        loading: false
      }
    $scope.director = director;
    });

    $scope.numberWithCommas = function(n) {
      return n ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
    }

    $http.get('/api/directors').success(function(directors) {
      $scope.directors = directors;
    });

  }]);
