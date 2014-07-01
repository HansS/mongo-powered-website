var novlr = require("./novlr");

novlr.factory("storageService",
  ["$window", "$timeout", "$q", function($window, $timeout, $q) {

      var storage = $window.localStorage;
      return {
        getItem: function(key) {
          var value = storage.getItem(key);
          try {
            return angular.fromJson(value);
          } catch (e) {
            return null;
          }
        },
        // $getItem: function(key) {
        //   var that = this;
        //   var deferred = $q.defer();
        //   $timeout.setTimeout(function() {
        //     deferred.resolve(that.getItem(key));
        //   }, 0);

        //   return deferred.promise;
        // },
        setItem: function(key, value) {
          value = angular.toJson(value);
          return storage.setItem(key, value);
        },
        // $setItem: function(key, value) {
        //   var that = this;
        //   var deferred = $q.defer();
        //   $timeout.setTimeout(function() {
        //     deferred.resolve(that.setItem(key, value));
        //   }, 0);

        //   return deferred.promise;
        // },
        key: storage.key.bind(storage),
        clear: storage.clear.bind(storage),
        removeItem: storage.removeItem.bind(storage),
      };

  }]);