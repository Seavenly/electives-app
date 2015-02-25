(function() {
  'use strict';

  function students($window, $http, $q, authEvents) {

    function load() {
      var deferred = $q.defer();
      if(studentsObj.data) { deferred.resolve(studentsObj.data); }
      else {
        $http.get('http://localhost:8080/api/students')
          .success(function(data) {
            studentsObj.data = data;
            deferred.resolve(studentsObj.data);
          })
          .error(function(data) {
            deferred.reject(data);
          });
      }
      return deferred.promise;
    }

    function addAll(files) {
      if(files && files.length) {
        if($window.FileReader){
          var reader = new $window.FileReader();
          reader.onload = function(e) {
            var temp = e.target.result;
            temp = temp.split('\n');

            for(var i=0; i<temp.length; i++){
              if(temp[i]) { temp[i] = temp[i].split(','); }
            }
            $http.post('http://localhost:8080/api/students', { students: temp })
              .success(function(data) {
                studentsObj.data = studentsObj.data.concat(data);
              });
          };
          reader.readAsText(files[0]);
        } else {
          $window.alert('Please upgrade your browser to read files into the system');
        }
      }
    }

    function update(data) {
      $http.put('http://localhost:8080/api/student/' + data._id, data)
        .success(function(data) {
          _.assign(_.find(studentsObj.data, { _id: data._id }), data);
        });
    }

    function remove(id) {
      $http.delete('http://localhost:8080/api/student/' + id)
        .success(function(data) {
          console.log(data.message);
          var index = _.findIndex(studentsObj.data, { _id: id });
          studentsObj.data.splice(index, 1);
        });
    }

    authEvents.admin.onAuth(function() {
      load();
    });
    authEvents.admin.onUnauth(function() {
      studentsObj.data = null;
    });

    var studentsObj = {
      data: null,
      load: load,
      addAll: addAll,
      update: update,
      remove: remove
    };
    return studentsObj;
  }

  angular.module('electivesApp')
    .factory('students', ['$window', '$http', '$q', 'authEvents', students]);

})();
