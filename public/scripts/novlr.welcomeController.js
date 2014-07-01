var novlr = require("./novlr");

novlr.controller('welcomeController',
  ["$scope", "$location", "$resource", function($scope, $location, $resource) {

    var User = $resource("/api/user/:id", {}, {update:{method:"PUT"}});
    $scope.title = "";

    $scope.renameAndClose = function(title) {
      var id = $scope.user._id;
      User.update({id:id}, {"novel.title":title})
        .$promise
        .then(function () {
          $location.path('/');
          $scope.user.novel.title = title;
        });
    };

}]);