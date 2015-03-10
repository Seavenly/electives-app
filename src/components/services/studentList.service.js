(function() {
  'use strict';

  function studentList($http, $q, user, electives) {
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

    // 1.  3 electives per quarter
    // 2.  elective available for user's grade
    // 3.  elective available in listed quarter
    // 4.  8th graders need required elective(s) if not complete
    function validateList(currUser) {
      var userList = currUser.data.list;
      var errors = [];

      var requiredElectives = _.pluck(_.filter(electives.data, { required: true }), '_id');
      var missingRequired = _.difference(requiredElectives, currUser.required);
      var addedRequired = [];

      for (var quarter in userList) {
        // 1.
        if (userList[quarter].length !== 3) {
          errors.push('invalid length: '+userList[quarter].length+' ('+quarter+')');
        }
        for (var i in userList[quarter]) {
          var elective = electives.findById(userList[quarter][i]);
          // 2.
          if (_.indexOf(elective.grades, currUser.data.grade) === -1) {
            errors.push('invalid grade: '+currUser.grade+' ('+elective.name+' '+elective.grades+')');
          }
          // 3.
          if (_.indexOf(elective.available, +quarter[1]) === -1) {
            errors.push('invalid quarter: '+quarter[1]+' ('+elective.name+' '+elective.quarters.available+')');
          }
          if (_.indexOf(missingRequired, elective._id) !== -1) {
            addedRequired.push(elective._id);
          }
        }
      }
      // 4.
      var missing = _.difference(missingRequired, addedRequired);
      missing = _.map(missing, function(id) { return electives.findById(id).name; });
      if (missing.length > 0 && currUser.data.grade === 8) {
        errors.push('The following elective(s) are required: '+missing.toString());
      }
      if (errors.length > 0) {
        console.log(errors);
        return false;
      }
      return true;
    }

    function save() {
      var currUser = user.currentUser();
      currUser.data.list.q1 = _.pluck(_.sortBy(list[0], 'pref'), '_id');
      currUser.data.list.q2 = _.pluck(_.sortBy(list[1], 'pref'), '_id');
      currUser.data.list.q3 = _.pluck(_.sortBy(list[2], 'pref'), '_id');
      currUser.data.list.q4 = _.pluck(_.sortBy(list[3], 'pref'), '_id');

      if (validateList(currUser)) {
        console.log('list:', currUser.data.list);
        $http.put('http://localhost:8080/api/student/' + currUser._id, { data: { list: currUser.data.list, submit: true }})
          .success(function(data) {
            console.log(data);
            _.assign(currUser, data);
          });
      }
    }

    function load() {
      var deferred = $q.defer();
      $q.all([user.load(), electives.load()]).then(function(data) {
        var currUser = data[0];
        if(currUser) {
          console.log(currUser);
          for (var i in list) {
            for (var j in currUser.data.list['q'+(+i+1)]) {
              list[i].push({
                _id: currUser.data.list['q'+(+i+1)][j],
                pref: +j+1,
                name: electives.findById(currUser.data.list['q'+(+i+1)][j]).name,
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

    function unload() {
      list = [ [], [], [], [] ];
    }

    return {
      getList: getList,
      load: load,
      unload: unload,
      set: set,
      save: save,
      getPref: getPref
    };
  }

  angular.module('electivesApp')
    .factory('studentList', ['$http', '$q', 'user', 'electives', studentList]);

})();
