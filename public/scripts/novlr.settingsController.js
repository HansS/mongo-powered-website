var novlr = require("./novlr");

novlr.controller('settingsController',
  ["$resource", "$scope", "$rootScope", "$location", "chapterService",
  function($resource, $scope, $rootScope, $location, chapterService) {

    var Profile = $resource("/api/profile/:id", {}, {update:{method:"PUT"}});

    $scope.init = function () {
      $scope.form = {};
      $scope.err = {};
      $scope.success = null;
    };

    $scope.saveDisabled = function () {
      return !($scope.form.oldpassword
           && $scope.form.password
           && $scope.form.passwordconfirm);
    };

  	$scope.getTotalWordCount = function() {
      var chapters = chapterService.local.get_all();
      $scope.totalWordcount = chapters.reduce(function (prev, chapter) {
        return prev + (chapter.count || 0);
      }, 0);
      $scope.chapterCount = chapters.length;
  	};

    $scope.usermodel = {
      created: $rootScope.user.created,
      email: $rootScope.user.email,
      firstname: $rootScope.user.firstname,
      lastname: $rootScope.user.lastname
    };

    $scope.updatePassword = function() {
      Profile
        .update({id: $rootScope.user._id}, $scope.form)
        .$promise
        .then(function() {
          $scope.init();
          $scope.success = "New password successfully saved!";
        })
        .catch(function (err) {
          $scope.err = err.data;
        });
    };

    $scope.close = function() {
      $location.path('/');
      $('.paper iframe').contents().find('.editor-container').focus();
    };

    $scope.init();
    $scope.getTotalWordCount();
}]);