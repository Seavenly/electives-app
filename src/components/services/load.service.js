(function() {
  'use strict';

  function load($q, authEvents, user, electives, admins, students, groups, studentList) {

    function all() {
      return $q.all([electives.load(), user.load()]).then(function(data) {
        if(data[1]){
          if (data[1].access === 'student') {
            studentList.load();
          } else if (data[1].access === 'admin') {
            students.load();
            groups.load();
            admins.load();
          }
        }
      });
    }

    authEvents.admin.onAuth(function() {
      students.load();
      groups.load();
      admins.load();
    });
    authEvents.admin.onUnauth(function() {
      students.unload();
      groups.unload();
      admins.unload();
    });

    authEvents.student.onAuth(function() {
      studentList.load();
    });
    authEvents.student.onUnauth(function() {
      studentList.unload();
    });

    return {
      all: all
    };

  }

  angular.module('electivesApp')
    .factory('load', ['$q', 'authEvents', 'user', 'electives', 'admins', 'students', 'groups', 'studentList', load]);

})();
