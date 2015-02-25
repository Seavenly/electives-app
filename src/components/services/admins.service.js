(function() {
  'use strict';

  function admins($http, $q, authEvents) {

     function load() {
       var deferred = $q.defer();
       if (adminsObj.data) { deferred.resolve(adminsObj.data); }
       else {
         $http.get('http://localhost:8080/api/admins')
          .success(function(data) {
            adminsObj.data = data;
            deferred.resolve(adminsObj.data);
          })
          .error(function(data) {
            deferred.reject(data);
          });
       }
       return deferred.promise;
     }

     function create(admin) {
       return $http.post('http://localhost:8080/api/admins', admin)
        .success(function(data) {
          adminsObj.data = adminsObj.data.concat(data);
        });

     }

     function update(admin) {
       return $http.put('http://localhost:8080/api/admins/' + admin._id, admin)
        .success(function(data) {
          _.assign(_.find(adminsObj.data, { _id: data._id }), data);
        });
     }

     function remove(admin) {
       return $http.delete('http://localhost:8080/api/admins' + admin._id)
        .success(function(data) {
          console.log(data.message);
          var index = _.findIndex(adminsObj.data, { _id: admin._id });
          adminsObj.data.splice(index, 1);
        });
     }

     authEvents.admin.onAuth(function() {
       load();
     });
     authEvents.admin.onUnauth(function() {
       adminsObj.data = null;
     });

     var adminsObj = {
       data: null,
       load: load,
       create: create,
       update: update,
       remove: remove
     };
     return adminsObj;
  }

  angular.module('electivesApp')
    .factory('admins', ['$http', '$q', 'authEvents', admins]);

})();
