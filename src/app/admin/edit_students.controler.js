(function() {
  'use strict';

  function EditStudentsCtrl(studentList) {
    var vm = this;

    vm.search = '';
    vm.show6 = vm.show7 = vm.show8 = true;
    vm.currentEdit = {};
    vm.allStudents = studentList.getStudents;

    vm.addAllStudents = function() {
      studentList.addAllStudents(vm.studentsFile);
    };

    vm.gradeFilter = function(val) {
      if (vm.show6 && val.grade === 6) {
        return true;
      } else if (vm.show7 && val.grade === 7) {
        return true;
      } else if (vm.show8 && val.grade === 8) {
        return true;
      } else {
        return false;
      }
    };

    vm.toggleEdit = function(index, student) {
      if (vm.currentEdit.index === index) {
        vm.currentEdit.index = null;
      } else {
        vm.currentEdit = angular.copy(student);
        vm.currentEdit.index = index;
      }
    };

    vm.updateStudent = function() {
      studentList.updateStudent(vm.currentEdit);
    };

  }

  angular.module('electivesApp')
    .controller('EditStudentsCtrl', ['studentList', '$upload', EditStudentsCtrl]);

})();
