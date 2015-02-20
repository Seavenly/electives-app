(function() {
  'use strict';

  function studentList($http, $q, user, electives, authEvents) {
    var list = [ [], [], [], [] ];

    function getList() {
      return list;
    }

    function set(elective, quarter, pref) {
      var exist = _.findWhere(list[quarter], { _id: elective._id });
      var prefExist = _.findWhere(list[quarter], { pref: pref });

      if (prefExist) {
        list[quarter].splice(_.indexOf(list[quarter], prefExist), 1);
      }

      if (exist  && pref !== 0) {
        exist.pref = pref;
      } else if (exist && pref === 0) {
        list[quarter].splice(_.indexOf(list[quarter], exist), 1);
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

      $http.put('http://localhost:8080/api/student/' + currUser._id, { list: currUser.list})
        .success(function(data) {
          _.assign(currUser, data);
        });
    }

    function load() {
      var deferred = $q.defer();
      $q.all([user.load(), electives.load()]).then(function(data) {
        var currUser = data[0];
        if(currUser) {
          for (var i in list) {
            for (var j in currUser.list['q'+(+i+1)]) {
              list[i].push({
                _id: currUser.list['q'+(+i+1)][j],
                pref: +j+1,
                name: electives.findById(currUser.list['q'+(+i+1)][j]).name,
              });
            }
          }
        }
        deferred.resolve();
      })
      .catch(function(err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    authEvents.student.onAuth(function() {
      load();
    });
    authEvents.student.onUnauth(function() {
      list = [ [], [], [], [] ];
    });

    return {
      getList: getList,
      load: load,
      set: set,
      save: save,
      getPref: getPref
    };
  }

  angular.module('electivesApp')
    .factory('studentList', ['$http', '$q', 'user', 'electives', 'authEvents', studentList]);

})();
