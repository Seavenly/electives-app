(function() {
  'use strict';

  function electives($http) {

    function getAll() {
      $http.get('http://localhost:8080/api/electives')
        .success(function(data) {
          electivesObj.data = data;
        });
    }
    getAll();

    function add(elective) {
      $http.post('http://localhost:8080/api/electives', elective)
        .success(function(data) {
          electivesObj.data = electivesObj.data.concat(data);
        });
    }

    function update(elective) {
      $http.put('http://localhost:8080/api/electives/' + elective._id, elective)
        .success(function(data) {
          _.assign(_.find(electivesObj.data, { _id: elective._id }), data);
        });
    }

    function remove(id) {
      $http.delete('http://localhost:8080/api/electives/' + id)
        .success(function() {
          var index = _.findIndex(electivesObj.data, { _id: id});
          electivesObj.data.splice(index, 1);
        });
    }

    function findById(id) {
      return _.find(electivesObj.data, { _id: id });
    }

    var electivesObj = {
      data: null,
      add: add,
      update: update,
      delete: remove,
      findById: findById
    };
    return electivesObj;
  }

  angular.module('electivesApp')
    .factory('electives', ['$http', electives]);

})();
