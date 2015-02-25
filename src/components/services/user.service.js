(function() {
  'use strict';

  function user($http, $q, authEvents) {
    var currUser = null;

    function currentUser() {
      return currUser;
    }

    function load() {
      var deferred = $q.defer();
      if(currUser) { deferred.resolve(currUser); }
      else {
        $http.post('http://localhost:8080/auth/profile')
          .success(function(data) {
            if (data.hasOwnProperty('_id')) {
              currUser = data;
              deferred.resolve(currUser);
            } else {
              deferred.resolve(false);
            }
          })
          .error(function(data) {
            deferred.reject(data);
          });
      }
      return deferred.promise;
    }

    function login(username, password) {
      $http({
        method: 'POST',
        url: 'http://localhost:8080/auth/login',
        params: {
          username: username,
          password: password
        },
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      })
        .success(function(data) {
          if (data.hasOwnProperty('_id')) {
            currUser = data;
            if (currUser.access === 'student') { authEvents.student.auth(); }
            else if (currUser.access === 'admin') { authEvents.admin.auth(); }

          }
        });
    }

    function logout() {
      $http.post('http://localhost:8080/auth/logout')
        .success(function() {
          if (currUser.access === 'student') { authEvents.student.unauth(); }
          else if (currUser.access === 'admin') { authEvents.admin.unauth(); }
          currUser = null;
        });
    }

    return {
      currentUser: currentUser,
      login: login,
      logout: logout,
      load: load
    };
  }

  angular.module('electivesApp')
    .factory('user', ['$http', '$q', 'authEvents', user]);

})();
