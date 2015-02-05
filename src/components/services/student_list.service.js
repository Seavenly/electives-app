(function() {
  'use strict';

  function studentList($window, $http) {

    function getAllStudents(cb) {
      $http.get('http://localhost:8080/api/students')
        .success(function(data) {
          cb(data);
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
                console.log(data);
              });
          };
          reader.readAsText(files[0]);
        } else {
          $window.alert('Please upgrade your browser to read files into the system');
        }
      }
    }

    return {
      getAllStudents: getAllStudents,
      addAllStudents: addAllStudents
    };
  }

  angular.module('electivesApp')
    .factory('studentList', ['$window', '$http', studentList]);

})();
