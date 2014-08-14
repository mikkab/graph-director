'use strict';


angular.module('graphDirectorApp')
  .controller('ChartCtrl',['$scope', '$http', '$state', '$q', function ($scope, $http, $state, $q) {

    function getPosterPromise(name) {
      var deferred = $q.defer();
      $http.get(encodeURI('http://www.omdbapi.com/?t=' + name)).success(function(data) {
        console.log('poster for', name, data.Poster);
        deferred.resolve(data.Poster);
      });
      return deferred.promise;
    }

    $scope.director = null;
    $scope.new_director = ''

    $http.get('/api/director/' + $state.params.name).success(function(directors) {
      var director = directors[0];
      if (!director)
        return;
      var movies = director.movies;
      director.total_votes = _.reduce(movies, function(votes, movie) { return votes + movie.votes; }, 0);
      director.avg_rating = _.reduce(movies, function(total, movie) { return total + movie.rating * movie.votes; }, 0) / director.total_votes; 

      var movie_names = _.map(movies, function(movie) { return movie.name; }); 
      var gets = _.map(movie_names, function(name) { 
        var uri = encodeURI('http://www.omdbapi.com/?t=' + name);
        return $http.get(uri);
      });

      $q.all(gets).then(function(results) {
          var posters = {};
          angular.forEach(results, function(result) {
            posters[result.data.Title] = result.data.Poster.replace('SX300', 'SX70');
          });

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
          text: director.name
        },
        xAxis: {
          allowDecimals: false,
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
          data: _.map(movies, function(movie) { 

            return {
              x : movie.year, 
              y : movie.rating, 
              name : movie.name, 
              votes: $scope.numberWithCommas(movie.votes), 
              marker : { 
                symbol: 'url(' + posters[movie.name] + ')'
              }
            }; 
          }),
          showInLegend: false
        }],
        loading: false
      }
      });
    $scope.director = director;
    });

    $scope.numberWithCommas = function(n) {
      return n ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
    }

    $scope.submit = function() {
      console.log('submit ' + $scope.new_director);
    }
  }]);
