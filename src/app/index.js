'use strict';

angular.module('electivesApp', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngResource', 'ui.router', 'ui.bootstrap', 'angularFileUpload'])
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      })
      .state('electivesList', {
        url: '/electives_list',
        templateUrl: 'app/electives/electives_list.html',
        controller: 'ElectivesListCtrl as vm'
      })
      .state('elective', {
        url: '/electives_list/:id',
        templateUrl: 'app/electives/elective.html',
        controller: 'ElectiveCtrl as vm'
      })
      .state('studentList', {
        url: '/student_list',
        templateUrl: 'app/student/student_list.html',
        controller: 'StudentListCtrl as vm'
      })
      .state('editStudents', {
        url: '/admin/edit_students',
        templateUrl: 'app/admin/edit_students.html',
        controller: 'EditStudentsCtrl as vm'
      })
      .state('editElectives', {
        url: '/admin/edit_electives',
        templateUrl: 'app/admin/edit_electives.html',
        controller: 'EditElectivesCtrl as vm'
      });

    $urlRouterProvider.otherwise('/');
  })
;
