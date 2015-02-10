(function() {
  'use strict';

  function startFrom() {
    return function(input, start) {
      start = +start;
      return input.slice(start);
    };
  }

  angular.module('electivesApp')
    .filter('startFrom', startFrom);

})();
