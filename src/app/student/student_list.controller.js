(function() {
  'use strict';

  function StudentListCtrl(electives) {
    var vm = this;

    vm.electives = electives.getElectives;
    vm.list = [ [], [], [], [] ];

    vm.updateList = function(quarter, id, elective) {
      var exist = _.findWhere(vm.list[quarter], { _id: id });

      if(vm.model[quarter][id] === '0') {
        for(var i=0;i<vm.list[quarter].length;i++) {
          if(vm.list[quarter][i]._id === id) {
            return vm.list[quarter].splice(i, 1);
          }
        }
        return;
      }
      if(exist) {
        exist.pref = vm.model[quarter][id];
      } else {
        vm.list[quarter].push({
          _id: id,
          name: elective.name,
          pref: vm.model[quarter][id]
        });
      }
    };

    vm.disabled = function(pref, quarter) {
      if(_.findWhere(vm.list[quarter], { pref: pref })) {
        return true;
      } else {
        return false;
      }
    };
  }

  angular.module('electivesApp')
    .controller('StudentListCtrl', ['electives', StudentListCtrl]);

})();
