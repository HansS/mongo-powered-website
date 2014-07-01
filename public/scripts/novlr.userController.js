var novlr = require("./novlr");

novlr.controller('userController', 
  ["$resource", "$scope", function($resource, $scope) {

  var User = $resource("/api/user/:id", {}, {update:{method:"PUT"}});

  // renames novel, triggered by nEditable
  $scope.renameNovel = function(title, user) {
    var id = user._id;
    User.update({id:id}, {"novel.title":title}, function() {
    });
  };

}]);