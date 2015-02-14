'use strict';

angular.module('electivesApp')
  .controller('ElectiveCtrl',
  function(electives, $stateParams) {
    this.id = $stateParams.id;
    this.elective = electives.findById(this.id);
  });
