var novlr = require('./novlr');

novlr.factory("userService", ["$resource", "storageService", "$rootScope", "$q",
  function($resource, storageService, $rootScope, $q) {
    var User = $resource("/api/user");
    var key = "user";

    return {

      init: function () {
        var userService = this;
        return User.get({},
          function (user) {
            userService.local.update(user);
            return user;
          }).$promise;
      },

      local: {
        update: function (user) {
          return storageService.setItem(key, user);
        },
        get: function () {
          return storageService.getItem(key);
        }
      }

    }
  }]);