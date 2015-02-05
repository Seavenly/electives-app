'use strict';

angular.module('electivesApp')
  .filter('quarter',
  function() {
    return function(input, quarter) {
      quarter = typeof quarter === 'undefined' ? 1 : quarter;
      var qElectives = [];
      for(var i=0;i<input.length;i++) {
        if(input[i].quarters.avail.indexOf(quarter) !== -1) {
          qElectives.push(input[i]);
        }
      }
      return qElectives;
    };
  });
