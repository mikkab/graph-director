'use strict';

angular.module('graphDirectorApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('director', {
        url: '/director/:name',
        templateUrl: 'app/chart/chart.html',
        controller: 'ChartCtrl'
      })
      .state('chart', {
        url: '/chart/:name',
        templateUrl: 'app/chart/chart.html',
        controller: 'ChartCtrl'
      });
  });
