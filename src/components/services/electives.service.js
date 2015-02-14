(function() {
  'use strict';

  function electives($http) {

    var allElectives = null;

    function getElectives() {
      if(allElectives === null) {
        getAll();
      }
      return allElectives;
    }

    function getAll() {
      allElectives = [];
      $http.get('http://localhost:8080/api/electives')
        .success(function(data) {
          allElectives = data;
        });
    }

    function add(elective) {
      $http.post('http://localhost:8080/api/electives', elective)
        .success(function(data) {
          allElectives = allElectives.concat(data);
        });
    }

    function updateElective(elective) {
      $http.put('http://localhost:8080/api/electives/' + elective._id, elective)
        .success(function(data) {
          _.assign(_.find(allElectives, { _id: elective._id }), data);
          console.log(allElectives);
        });
    }

    function deleteElective(id) {
      $http.delete('http://localhost:8080/api/electives/' + id)
        .success(function() {
          var index = _.findIndex(allElectives, { _id: id});
          allElectives.splice(index, 1);
        });
    }

    return {
      getElectives: getElectives,
      getAll: getAll,
      add: add,
      update: updateElective,
      delete: deleteElective,
    };
  }

  angular.module('electivesApp')
    .factory('electives', ['$http', electives]);

})();
