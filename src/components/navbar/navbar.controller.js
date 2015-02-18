(function() {
  'use strict';

  function NavbarCtrl($state, $http, user) {
    var vm = this;

    vm.currentUser = user.currentUser;

    vm.isActive = function(state) {
      if($state.current.name === state) { return 'active'; }
    };

    vm.login = function() {
      user.login(vm.username, vm.password);
    };

    vm.logout = function() {
      user.logout();
    };

    vm.isLoggedIn = function() {
      return user.currentUser() !== null;
    };
  }

  angular.module('electivesApp')
    .controller('NavbarCtrl', ['$state', '$http', 'user', NavbarCtrl]);

})();
