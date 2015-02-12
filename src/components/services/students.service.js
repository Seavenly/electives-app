(function() {
  'use strict';

  function students($window, $http) {

    var allStudents = null;

    function getStudents() {
      if(allStudents === null) {
        getAllStudents();
      }
      return allStudents;
    }

    function getAllStudents() {
      allStudents = [];
      $http.get('http://localhost:8080/api/students')
        .success(function(data) {
          allStudents = data;
        });
    }

    function addAllStudents(files) {
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
                allStudents = allStudents.concat(data);
              });
          };
          reader.readAsText(files[0]);
        } else {
          $window.alert('Please upgrade your browser to read files into the system');
        }
      }
    }

    function updateStudent(data, cb) {
      $http.put('http://localhost:8080/api/student/' + data._id, data)
        .success(function(data) {
          _.assign(_.find(allStudents, { _id: data._id }), data);
          cb();
        });
    }

    function deleteStudent(id) {
      $http.delete('http://localhost:8080/api/student/' + id)
        .success(function() {
          var index = _.findIndex(allStudents, { _id: id });
          allStudents.splice(index, 1);
        });
    }

    return {
      getStudents: getStudents,
      getAllStudents: getAllStudents,
      addAllStudents: addAllStudents,
      updateStudent: updateStudent,
      deleteStudent: deleteStudent
    };
  }

  angular.module('electivesApp')
    .factory('students', ['$window', '$http', students]);

})();
