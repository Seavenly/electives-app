(function() {
  'use strict';

  function EditElectivesCtrl(electives) {
    var vm = this;

    vm.electives = electives.getElectives;
    vm.currentEdit = {};

    function setForm() {
      vm.form = {
        grades: {}
      };
      vm.form.grades[6] = vm.form.grades[7] = vm.form.grades[8] = true;
      vm.form.semester = 'false';
    }

    setForm();

    vm.setElective = function(exists) {
      var quarters  = [];
      var grades    = [];
      var form = vm.form;
      if(exists) {
        form = vm.currentEdit;
      }
      for(var quarter in form.quarters) {
        if(form.quarters[quarter] === true) { quarters.push(+quarter); }
      }
      for(var grade in form.grades) {
        if(form.grades[grade] === true) { grades.push(+grade); }
      }

      console.log(form.semester);

      var elective = {
        _id:          form._id,
        name:         form.name,
        description:  form.description,
        images:       [form.image],
        semester:     (form.semester === 'true'),
        grades:       grades,
        cap:          form.cap,
        quarters: {
          available:     quarters
        }
      };
      if(!exists) {
        electives.add(elective);
        setForm();
      }
      else { electives.update(elective); }
    };

    vm.toggleEdit = function(index, elective) {
      if (vm.currentEdit.index === index) {
        vm.currentEdit.index = null;
      } else {
        var grades = {},
            quarters = {};
        vm.currentEdit = angular.copy(elective);
        vm.currentEdit.index = index;
        for(var q in vm.currentEdit.quarters.available) {
         quarters[vm.currentEdit.quarters.available[q]] = true;
        }
        for(var g in vm.currentEdit.grades) {
          grades[vm.currentEdit.grades[g]] = true;
        }
        vm.currentEdit.grades = grades;
        vm.currentEdit.quarters = quarters;
        vm.currentEdit.image = vm.currentEdit.images[0];
        vm.currentEdit.semester = vm.currentEdit.semester.toString();
      }
    };

    vm.allSelected = false;
    vm.toggleSelectAll = function() {
      vm.allSelected = !vm.allSelected;
      for(var key in vm.checkbox) {
        vm.checkbox[key] = vm.allSelected;
      }
    };

    vm.deleteElectives = function() {
      for(var key in vm.checkbox) {
        if (vm.checkbox[key] === true) {
          electives.delete(key);
        }
      }
      if (vm.allSelected) { vm.toggleSelectAll(); }
    };

  }

  angular.module('electivesApp')
    .controller('EditElectivesCtrl', ['electives', EditElectivesCtrl]);

})();
