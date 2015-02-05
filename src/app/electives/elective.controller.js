'use strict';

angular.module('electivesApp')
  .controller('ElectiveCtrl',
  function(Electives, $stateParams) {
    this.id = $stateParams.id;
    this.elective = Electives.findById(this.id);
  });
