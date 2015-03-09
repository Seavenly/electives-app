(function() {
  'use strict';

  function EditGroupsCtrl(groups, electives) {
    var vm = this;

    vm.groups = groups;
    vm.electives = electives;
    vm.currentEdit = {};

    function setForm() {
      vm.form = {
        elective: 'default',
        electives: []
      };
    }
    setForm();

    vm.setGroup = function(exists) {
      var form = vm.form;
      if (exists) { form = vm.currentEdit; }

      var group = {
        _id: form._id,
        name: form.name,
        description: form.description,
        perYear: form.perYear,
        electives: _.pluck(form.electives, '_id')
      };

      if (!exists) {
        groups.add(group);
        setForm();
      } else { groups.update(group); }
    };

    vm.toggleEdit = function(index, group) {
      if (vm.currentEdit.index === index) {
        vm.currentEdit.index = null;
      } else {
        vm.currentEdit = angular.copy(group);
        vm.currentEdit.index = index;

        vm.currentEdit.elective = 'default';
        vm.currentEdit.electives = _.map(vm.currentEdit.electives, function(n) {
          return _.find(vm.electives.data, {_id: n});
        });
      }
    };

    vm.allSelected = false;
    vm.toggleSelectAll = function() {
      vm.allSelected = !vm.allSelected;
      for(var key in vm.checkbox) {
        vm.checkbox[key] = vm.allSelected;
      }
    };

    vm.deleteGroups = function() {
      for(var key in vm.checkbox) {
        if (vm.checkbox[key] === true) {
          groups.remove(key);
        }
      }
      if (vm.allSelected) { vm.toggleSelectAll(); }
    };

    vm.addElective = function(exists) {
      var form = vm.form;
      if (exists) { form = vm.currentEdit; }
      var check = _.find(form.electives, function(n) {
        return n._id === form.elective;
      });
      if (form.elective !== 'default' && !check) {
        form.electives.push(_.find(electives.data, { _id: form.elective }));
      }
      form.elective = 'default';
    };

    vm.removeElective = function(elective, exists) {
      var form = vm.form;
      if (exists) { form = vm.currentEdit; }
      var index = _.findIndex(form.electives, function(n) {
        return n._id === elective._id;
      });
      form.electives.splice(index, 1);
    };

  }


  angular.module('electivesApp')
    .controller('EditGroupsCtrl', ['groups', 'electives', EditGroupsCtrl]);

})();
