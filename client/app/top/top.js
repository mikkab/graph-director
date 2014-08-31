'use strict';

angular.module('graphDirectorApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('top', {
        url: '/top',
        templateUrl: 'app/top/top.html',
        controller: 'TopCtrl'
      });
  });
