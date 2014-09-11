'use strict';



function get_poster_url(movie) {
  return 'https://s3.amazonaws.com/graph_director_movie_posters/' + movie.poster + '.jpg';
}

function get_amazon_url(movie) {
  return 'http://www.amazon.com/s/?ref=nb_ss_d&tag=graphdirector-20&url=search-alias%3Ddvd&field-keywords=' + movie.name;
}

function get_imdb_url(movie) {
  return 'http://www.imdb.com/title/' + movie.imdbId;
}

    (function (H) {
      H.wrap(H.Tooltip.prototype, 'hide', function (defaultCallback) {
        if (arguments[1] === 'hide') {
          defaultCallback.apply(this);
        }
      });
    }(Highcharts));

angular.module('graphDirectorApp')
  .controller('ChartCtrl',['$scope', '$http', '$stateParams', '$q', function ($scope, $http, $stateParams, $q) {

    $scope.director = null;
    $scope.show_chart = false;
    $scope.new_director = '';


    $http.get('/api/director/' + $stateParams.name).success(function(directors) {
      var director = directors[0];
      if (!director)
        return;
      var movies = director.movies;
      director.total_votes = _.reduce(movies, function(votes, movie) { return votes + movie.votes; }, 0);
      director.avg_rating = _.reduce(movies, function(total, movie) { return total + movie.rating * movie.votes; }, 0) / director.total_votes; 

      $scope.posters = _.map(movies, get_poster_url);

      var data = _.map(movies, function(movie) {
        return {
          x : movie.year,
          y : movie.rating,
          name : movie.name,
          imdbUrl : get_imdb_url(movie),
          amazonUrl : get_amazon_url(movie),
          votes: $scope.numberWithCommas(movie.votes),
          poster: get_poster_url(movie)
        };
      });

      var xy_data = _.map(data, function(point) {
        return [point.x, point.y];
      });

      $scope.config = {
        options: {
          chart: {
            events: {
              click: function(event) {
                this.tooltip.hide('hide');
              }
            }
          },
          tooltip: {
            useHTML: true,
            hideDelay: 0,
            formatter: function () {
              if (this.series.name !== 'Ratings') {
                return false;
              }
              return '<b>' + this.point.name + '</b><br>' +
                '<img src="' + this.point.poster + '"><br>' +
                'rating: ' + this.point.y + '<br>' +
                'votes: ' + this.point.votes + '<br>' +
                '<a class="imdb_link" href="' + this.point.imdbUrl + '">{imdb}</a>' +
                '<a class="amazon_link" href="' + this.point.amazonUrl + '">{amazon}</a>'
                ;
            }
          },
          exporting: {
            sourceHeight: 600,
            sourceWidth: 1920
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
          type: 'scatter',
          data: data,
          showInLegend: false
        }, {
          type: 'line',
          marker: {enabled: false},
          enableMouseTracking: false,
          data: (function() {
            return fitData(xy_data).data;
          })(),
          showInLegend: false
        }],
        loading: false
      };
    $scope.director = director;
    $scope.show_director = true;
    });

    $scope.numberWithCommas = function(n) {
      return n ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
    };

  }]);
