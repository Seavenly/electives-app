(function() {
  'use strict';

  function EditStudentsCtrl(studentList) {
    var vm = this;

    vm.addAllStudents = function() {
      studentList.addAllStudents(vm.studentsFile);
    };
    studentList.getAllStudents(function(data) {
      vm.allStudents = data;
    });

  }

  angular.module('electivesApp')
    .controller('EditStudentsCtrl', ['studentList', '$upload', EditStudentsCtrl]);

})();
