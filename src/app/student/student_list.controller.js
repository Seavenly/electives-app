(function() {
  'use strict';

  function StudentListCtrl(studentList, electives) {
    var vm = this;

    vm.electives = electives;
    vm.list = studentList.getList;
    vm.getPref = studentList.getPref;

    vm.updateList = function(quarter, elective) {
      for (var id in vm.model[quarter]) {
        if(vm.model[quarter][id] === vm.model[quarter][elective._id] && id !== elective._id) {
          vm.model[quarter][id] = 0;
        }
      }
      studentList.add(elective, quarter, vm.model[quarter][elective._id]);
    };

    vm.saveList = function() {
      studentList.save();
    };

  }

  angular.module('electivesApp')
    .controller('StudentListCtrl', ['studentList', 'electives', StudentListCtrl]);

})();
