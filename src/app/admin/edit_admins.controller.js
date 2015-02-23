(function() {
  'use strict';

  function EditAdminsCtrl(admins) {
    var vm = this;

    vm.admins = admins;
    vm.currentEdit = {};

    function resetForm() {
      vm.form = {};
    }

    vm.setUser = function(exists) {
      var form = vm.form;
      if (exists) { form = vm.currentEdit; }
      if (form.password !== form.passwordCheck) { return console.log('Password mismatch'); }

      if (exists) {
        admins.update(form);
      } else {
        admins.create(form);
        resetForm();
      }
    };

    vm.toggleEdit = function(index, user) {
      if (vm.currentEdit.index === index) {
        vm.currentEdit.index = null;
      } else {
        vm.currentEdit = angular.copy(user);
        vm.currentEdit.index = index;
      }
    };

    vm.allSelected = false;
    vm.toggleSelectAll = function() {
      vm.allSelected = !vm.allSelected;
      for(var key in vm.checkbox) {
        vm.checkbox[key] = vm.allSelected;
      }
    };

    vm.deleteAdmins = function() {
      for(var key in vm.checkbox) {
        if (vm.checkbox[key] === true) {
          admins.remove(key);
        }
      }
      if (vm.allSelected) { vm.toggleSelectAll(); }
    };

  }

  angular.module('electivesApp')
    .controller('EditAdminsCtrl', ['admins', EditAdminsCtrl]);

})();
