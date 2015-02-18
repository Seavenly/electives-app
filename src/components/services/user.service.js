(function() {
  'use strict';

  function user($http) {
    var currUser = null;

    function currentUser() {
      return currUser;
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
          }
        });
    }

    function logout() {
      $http.post('http://localhost:8080/auth/logout')
        .success(function() {
          currUser = null;
        });
    }

    function isLoggedIn() {
      $http.post('http://localhost:8080/auth/profile')
        .success(function(data) {
          if (data._id) {
            currUser = data;
          }
        });
    }

    return {
      currentUser: currentUser,
      login: login,
      logout: logout,
      isLoggedIn: isLoggedIn
    };
  }

  angular.module('electivesApp')
    .factory('user', ['$http', user]);

})();
