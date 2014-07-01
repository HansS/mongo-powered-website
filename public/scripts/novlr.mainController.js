var novlr = require("./novlr");

novlr.controller('mainController', ["$scope", "$rootScope", "$http", "$templateCache", "offlineService", "chapterService", "userService", "storageService",
  function ($scope, $rootScope, $http, $templateCache, offlineService, chapterService, userService, storageService) {
    // Cache templates for use offline.
    $http.get("/public/templates/nprompt.html", {cache: $templateCache});
    $http.get("/public/templates/nconfirm.html", {cache: $templateCache});

    // Load user.
    userService.init()
      .then(function(user) {
        $rootScope.user = user;
        $scope.user = user;
        // Load chapters.
        chapterService.init();
      })
      .catch(function(response_failure) {
        var local_user = userService.local.get();
        $rootScope.user = local_user;
        $scope.user = local_user;
        // Load chapters.
        chapterService.init();
      });

    // Watch for updates to local storage from another tab.
    offlineService.local_sync_init();

    $scope.app_status = 'online';

    $scope.$on("novlr-offline", function () {
      $scope.app_status = 'offline';
    });

    $scope.$on("novlr-online", function () {
      $scope.app_status = 'online';
    });

    $scope.$watch("app_status", function (newval, oldval) {
      if (newval && oldval && (newval != oldval)) {
        var $msg = $('.novlrnavbar .message').find('.' + newval);
        $msg.fadeTo(200, 1);
        setTimeout(function () {
          $msg.fadeTo(1000, 0);
        }, 5000);
        // Novlr has gone offline. Check periodically if we're back yet.
        if (newval == 'offline') {
          offlineService.offline();
        }
        // Novlr back online. Sync everything back up.
        if (newval == 'online') {
          offlineService.online();
        }
      }
    });

    $scope.signOut = function() {
      $http.get('/signout')
        .then(function() {
          storageService.clear();
          window.location = '/';
        })
    }

  }]);