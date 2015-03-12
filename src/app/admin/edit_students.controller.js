(function() {
  'use strict';

  function EditStudentsCtrl(students, electives, $filter, $scope) {
    var vm = this;

    vm.limit = 10;
    vm.start = 0;
    vm.currPage = 0;
    vm.search = '';
    vm.show6 = vm.show7 = vm.show8 = true;
    vm.currentEdit = {};
    vm.temp = {};
    vm.students = students;
    vm.electives = electives;

    // Go to first page when user begins to search
    $scope.$watch(function() {
      return vm.search;
    }, function(newVal, oldVal) {
      if(newVal !== oldVal) {
        vm.goToPage(0);
      }
    });

    vm.addAllStudents = function() {
      students.addAll(vm.studentsFile);
    };

    vm.gradeFilter = function(val) {
      var name = (val.name.first + ' ' + val.name.last).toLowerCase();
      if(!(vm.show6 && val.data.grade === 6) && !(vm.show7 && val.data.grade === 7) && !(vm.show8 && val.data.grade === 8) || name.indexOf(vm.search.toLowerCase()) === -1) {
        return false;
      }
      return true;
    };

    vm.requiredFilter = function(val) {
      if (val.required) { return true; }
      return false;
    };

    vm.toggleEdit = function(index, student) {
      if (vm.currentEdit.index === index) {
        vm.currentEdit.index = null;
      } else {
        vm.currentEdit = angular.copy(student);
        vm.currentEdit.index = index;
        vm.temp.required = 'default';
        vm.currentEdit.data.required = _.map(vm.currentEdit.data.required, function(n) {
          return _.find(vm.electives.data, {_id: n});
        });
        console.log(vm.currentEdit.data.required);
      }
    };

    vm.setStudent = function(exists) {
      if (vm.studentsFile) { return students.addAll(vm.studentsFile); }
      var form = vm.form;
      if (exists) { form = vm.currentEdit; }

        var student = {
          _id: form._id,
          name: {
            first: form.name.first,
            last: form.name.last
          },
          data: {
            grade: form.data.grade
          }
        };

      if (exists) {
        student.data.required = _.pluck(form.data.required, '_id');
        students.update(student);
      } else {
        students.create(student);
        vm.form = {};
      }
    };

    vm.addRequired = function() {
      var form = vm.currentEdit;
      var check = _.find(form.data.required, function(n) {
        return n._id === vm.temp.required;
      });
      if (form.elective !== 'default' && !check) {
        form.data.required.push(_.find(electives.data, { _id: vm.temp.required }));
      }
      vm.temp.required = 'default';
    };

    vm.removeRequired = function(elective) {
      var form = vm.currentEdit;
      var index = _.findIndex(form.data.required, function(n) {
        return n._id === elective._id;
      });
      form.data.required.splice(index, 1);
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
          students.remove(key);
        }
      }
      if (vm.allSelected) { vm.toggleSelectAll(); }
    };

    vm.pages = function() {
      if (vm.students.data === null) { return; }
      var total = $filter('filter')($filter('filter')(vm.students.data, vm.search), vm.gradeFilter).length;
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
    .controller('EditStudentsCtrl', ['students', 'electives', '$filter', '$scope', EditStudentsCtrl]);

})();
