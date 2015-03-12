(function() {
  'use strict';

  function EditElectivesCtrl(electives) {
    var vm = this;

    vm.electives = electives;
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
      if (exists) { form = vm.currentEdit; }

      for(var quarter in form.quarters) {
        if(form.quarters[quarter] === true) { quarters.push(+quarter); }
      }
      for(var grade in form.grades) {
        if(form.grades[grade] === true) { grades.push(+grade); }
      }

      var elective = {
        _id:          form._id,
        name:         form.name,
        description:  form.description,
        images:       [form.image],
        semester:     (form.semester === 'true'),
        grades:       grades,
        required:     form.required,
        cap:          form.cap,
        available:    quarters
      };
      if(!exists) {
        electives.add(elective);
        setForm();
      } else { electives.update(elective); }
    };

    vm.toggleEdit = function(index, elective) {
      if (vm.currentEdit.index === index) {
        vm.currentEdit.index = null;
      } else {
        var grades = {},
            quarters = {};
        vm.currentEdit = angular.copy(elective);
        vm.currentEdit.index = index;
        for(var q in vm.currentEdit.available) {
         quarters[vm.currentEdit.available[q]] = true;
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
          electives.remove(key);
        }
      }
      if (vm.allSelected) { vm.toggleSelectAll(); }
    };

    function parseLog(log) {
      var parsedLog = [];
      for(var i = 0; i<log.length; i++) {
        var type = log[i][1];
        var message = log[i][2].toString();
        if (type === 'INFO') {
          message = '<div class="type text-muted">'+type+'</div><div class="text-muted">'+message+'</div>';
        } else if (type === 'HEAD') {
          message = '<div class="type bg-dark">'+type+'</div><div class="bg-dark"><strong>'+message+'</strong></div>';
        } else if (type === 'SUCCESS') {
          message = '<div class="type bg-success text-success">'+type+'</div><div class="bg-success text-success">'+message+'</div>';
        } else if (type.search('FILLED|OC1-FULL|LIMIT') !== -1) {
          message = '<div class="type bg-warning text-warning">'+type+'</div><div class="bg-warning text-warning">'+message+'</div>';
        } else if (type === 'ERROR') {
          message = '<div class="type bg-danger text-danger">'+type+'</div><div class="bg-danger text-danger">'+message+'</div>';
        } else {
          message = '<div>'+message+'</div>';
        }
        parsedLog.push('<div class="line-number">'+log[i][0]+'</div>'+message);
      }
      return parsedLog;
    }
    vm.calculateElectives = function() {
      electives.calculate().success(function(data) {
        console.log(data);
        vm.log = parseLog(data.message);
      });
    };

  }

  angular.module('electivesApp')
    .controller('EditElectivesCtrl', ['electives', EditElectivesCtrl]);

})();
