(function() {
  'use strict';

  function startFrom() {
    return function(input, start) {
      if (input === null) { return; }
      start = +start;
      return input.slice(start);
    };
  }

  angular.module('electivesApp')
    .filter('startFrom', startFrom);

})();
