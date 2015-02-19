(function() {
  'use strict';

  function studentList($http, $timeout, user, electives) {
    var list = [ [], [], [], [] ];

    function getList() {
      return list;
    }

    function add(elective, quarter, pref) {
      var exist = _.findWhere(list[quarter], { _id: elective._id });
      var prefExist = _.findWhere(list[quarter], { pref: pref });

      if (prefExist) {
        list[quarter].splice(_.indexOf(list[quarter], prefExist), 1);
      }

      if (exist) {
        exist.pref = pref;
      } else {
        list[quarter].push({
          _id: elective._id,
          name: elective.name,
          pref: pref
        });
      }
    }

    function getPref(quarter, id) {
      var elective = _.findWhere(list[quarter], { _id: id });
      if (elective) { return elective.pref; }
      else { return 0; }
    }

    function save() {
      var currUser = user.currentUser();
      currUser.list.q1 = _.pluck(_.sortBy(list[0], 'pref'), '_id');
      currUser.list.q2 = _.pluck(_.sortBy(list[1], 'pref'), '_id');
      currUser.list.q3 = _.pluck(_.sortBy(list[2], 'pref'), '_id');
      currUser.list.q4 = _.pluck(_.sortBy(list[3], 'pref'), '_id');

      console.log(currUser.list);

      $http.put('http://localhost:8080/api/student/' + currUser._id, { list: currUser.list})
        .success(function(data) {
          console.log(data);
          _.assign(currUser, data);
        });
    }

    function getInitialList() {
      var currUser = user.currentUser();
      if (currUser && electives.data) {
        console.log('Found list:', currUser);
        for (var i in list) {
          for (var j in currUser.list['q'+(+i+1)]) {
            console.log(j);
            list[i].push({
              _id: currUser.list['q'+(+i+1)][j],
              pref: +j+1,
              name: electives.findById(currUser.list['q'+(+i+1)][j]).name,
            });
          }
        }
        console.log(list);
      } else {
        console.log('Searching for list...');
        $timeout(function() {
          getInitialList();
        }, 300);
      }
    }
    getInitialList();

    return {
      getList: getList,
      add: add,
      save: save,
      getPref: getPref
    };
  }

  angular.module('electivesApp')
    .factory('studentList', ['$http', '$timeout', 'user', 'electives', studentList]);

})();
