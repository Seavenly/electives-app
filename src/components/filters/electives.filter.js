'use strict';

angular.module('electivesApp')
  .filter('quarter',
  function() {
    return function(input, quarter) {
      if (input === null) { return; }
      quarter = typeof quarter === 'undefined' ? 1 : quarter;
      var qElectives = [];
      for(var i=0;i<input.length;i++) {
        if(input[i].available.indexOf(quarter) !== -1) {
          qElectives.push(input[i]);
        }
      }
      return qElectives;
    };
  });
