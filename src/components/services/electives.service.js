(function() {
  'use strict';

  function electives($http, $q) {

    function load() {
      var deferred = $q.defer();
      if(electivesObj.data) { deferred.resolve(electivesObj.data); }
      else {
        $http.get('http://localhost:8080/api/electives')
          .success(function(data) {
            electivesObj.data = data;
            deferred.resolve(electivesObj.data);
          })
          .error(function(data) {
            deferred.reject(data);
          });
      }
      return deferred.promise;
    }

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

    function calculate() {
      return $http.get('http://localhost:8080/api/actions/electives/calculate');
    }

    function findById(id) {
      return _.find(electivesObj.data, { _id: id });
    }

    function unload() {
      electivesObj.data = null;
    }

    var electivesObj = {
      data: null,
      load: load,
      unload: unload,
      add: add,
      update: update,
      delete: remove,
      calculate: calculate,
      findById: findById
    };
    return electivesObj;
  }

  angular.module('electivesApp')
    .factory('electives', ['$http', '$q', electives]);

})();
