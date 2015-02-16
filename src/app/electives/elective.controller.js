(function(){
  'use strict';

  function ElectiveCtrl($scope, electives, $stateParams) {
    var vm = this;

    vm.id = $stateParams.id;
    vm.elective = electives.findById(vm.id);

    $scope.$watch(function(){
      return electives.findById(vm.id);
    }, function(newVal) {
      vm.elective = newVal;
    });
  }

  angular.module('electivesApp')
    .controller('ElectiveCtrl', ['$scope', 'electives', '$stateParams', ElectiveCtrl]);

})();
