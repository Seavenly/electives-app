'use strict';

angular.module('electivesApp')
  .controller('ElectivesListCtrl',
  function(Electives) {
    this.electives = Electives.all;
  });
