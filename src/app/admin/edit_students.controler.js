(function() {
  'use strict';

  function EditStudentsCtrl(studentList, $filter, $scope) {
    var vm = this;

    vm.limit = 10;
    vm.start = 0;
    vm.currPage = 0;
    vm.search = '';
    vm.show6 = vm.show7 = vm.show8 = true;
    vm.currentEdit = {};
    vm.allStudents = studentList.getStudents;

    // Go to first page when user begins to search
    $scope.$watch(function() {
      return vm.search;
    }, function(newVal, oldVal) {
      if(newVal !== oldVal) {
        vm.goToPage(0);
      }
    });

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
      console.log(student);
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

    vm.allSelected = false;
    vm.toggleSelectAll = function() {
      vm.allSelected = !vm.allSelected;
      for(var key in vm.checkbox) {
        vm.checkbox[key] = vm.allSelected;
      }
    };

    vm.deleteStudents = function() {
      for(var key in vm.checkbox) {
        if (vm.checkbox[key] === true) {
          studentList.deleteStudent(key);
        }
      }
      if (vm.allSelected) { vm.toggleSelectAll(); }
    };

    vm.pages = function() {
      var total = $filter('filter')($filter('filter')(vm.allStudents(), vm.search), vm.gradeFilter).length;
      var numPages = Math.ceil(total / vm.limit);
      return new Array(numPages);
    };

    vm.goToPage = function(index) {
      if(index < 0 || index > vm.pages().length-1) {
        return;
      }
      vm.currentEdit.index = null;
      vm.currPage = index;
      vm.start = index * vm.limit;
    };

    vm.setLimit = function(num) {
      vm.limit = num;
      vm.goToPage(0);
    };

  }

  angular.module('electivesApp')
    .controller('EditStudentsCtrl', ['studentList', '$filter', '$scope', EditStudentsCtrl]);

})();
