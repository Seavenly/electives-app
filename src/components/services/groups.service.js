(function() {
  'use strict';

  function groups($http, $q) {

    function load() {
      var deferred = $q.defer();
      if (groupsObj.data) { deferred.resolve(groupsObj.data); }
      else {
        $http.get('http://localhost:8080/api/groups')
          .success(function(data) {
            groupsObj.data = data;
            deferred.resolve(groupsObj.data);
          })
          .error(function(data) {
            deferred.reject(data);
          });
      }
      return deferred.promise;
    }

    function add(group) {
      $http.post('http://localhost:8080/api/groups', group)
        .success(function(data) {
          console.log('group:', group);
          console.log('data:', data);
          groupsObj.data = groupsObj.data.concat(data);
        });
    }

    function update(group) {
      $http.put('http://localhost:8080/api/groups/' + group._id, group)
        .success(function(data) {
          _.assign(_.find(groupsObj.data, { _id: group._id }), data);
        });
    }

    function remove(groupId) {
      $http.delete('http://localhost:8080/api/groups/' + groupId)
        .success(function() {
          var index = _.findIndex(groupsObj.data, { _id: groupId });
          groupsObj.data.splice(index, 1);
        });
    }

    function unload() {
      groupsObj.data = null;
    }

    var groupsObj = {
      data: null,
      load: load,
      unload: unload,
      add: add,
      update: update,
      remove: remove
    };
    return groupsObj;
  }

  angular.module('electivesApp')
    .factory('groups', ['$http', '$q', groups]);

})();
