'use strict';

angular.module('electivesApp')
  .controller('ElectivesListCtrl',
  function(electives) {
    this.electives = electives.all;
  });
