(function() {
  'use strict';

  function NavbarCtrl($state, $http, user, authEvents) {
    var vm = this;

    vm.currentUser = user.currentUser;

    vm.isActive = function(state) {
      if($state.current.name === state) { return 'active'; }
    };

    vm.login = function() {
      user.login(vm.username, vm.password);
      vm.username = '';
      vm.password = '';
    };

    vm.logout = function() {
      user.logout();
    };

    vm.isLoggedIn = function() {
      if (user.currentUser()) {
        return user.currentUser().access;
      } else {
        return false;
      }
    };

    authEvents.admin.onUnauth(function() {
      $state.go('home');
    });
    authEvents.student.onUnauth(function() {
      $state.go('home');
    });

  }

  angular.module('electivesApp')
    .controller('NavbarCtrl', ['$state', '$http', 'user', 'authEvents', NavbarCtrl]);

})();
