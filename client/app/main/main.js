'use strict';

angular.module('graphDirectorApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/main',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      })
      .state('main.chart', {
        url: '/:name',
        templateUrl: 'app/chart/chart.html',
        controller: 'ChartCtrl'
      });
  });
