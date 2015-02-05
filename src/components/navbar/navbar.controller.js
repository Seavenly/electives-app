'use strict';

angular.module('electivesApp')
  .controller('NavbarCtrl', function ($state) {
    this.isActive = function(state) {
      if($state.current.name === state) { return 'active'; }
    };
  });
