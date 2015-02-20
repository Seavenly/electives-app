(function() {
  'use strict';

  function authEvents($rootScope) {

    function authStudent() {
      $rootScope.$broadcast('studentAuth');
    }

    function unauthStudent() {
      $rootScope.$broadcast('studentUnauth');
    }

    function onAuthStudent(cb) {
      $rootScope.$on('studentAuth', cb);
    }

    function onUnauthStudent(cb) {
      $rootScope.$on('studentUnauth', cb);
    }

    function authAdmin() {
      $rootScope.$broadcast('adminAuth');
    }

    function unauthAdmin() {
      $rootScope.$broadcast('adminUnauth');
    }

    function onAuthAdmin(cb) {
      $rootScope.$on('adminAuth', cb);
    }

    function onUnauthAdmin(cb) {
      $rootScope.$on('adminUnauth', cb);
    }

    return {
      student: {
        auth: authStudent,
        unAuth: unauthStudent,
        onAuth: onAuthStudent,
        onUnauth: onUnauthStudent
      },
      admin: {
        auth: authAdmin,
        unAuth: unauthAdmin,
        onAuth: onAuthAdmin,
        onUnauth: onUnauthAdmin,
      }
    };
  }

  angular.module('electivesApp')
      .factory('authEvents', ['$rootScope', authEvents]);

})();
