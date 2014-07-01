var novlr = angular.module("novlr", ["ngResource"]);

novlr.controller('signupController',
  ["$resource", "$window", "$scope", function($resource, $window, $scope) {

  var User    = $resource("/api/user/:id");
  var Chapter = $resource("/api/chapter/:id", {}, {update:{method:"PUT"}});

  $scope.myuser = {};

  var novel = {
    title: "My novel title",
    date: +new Date()
  };

  $scope.addUser = function(userModel, $event) {
    var user = new User();
    user = angular.extend(user, userModel);
    user.novel = novel;
    // TODO do we need this beta date, now we're not in beta?
    user.beta = (new Date() <= new Date(1412035200000)); /*30 sep 2014*/

    return user.$save()
     .then(function(){
        var chapter = new Chapter();
         chapter.title = "My First Chapter";
        chapter.newuser = true;
        return chapter.$save();
     })
     .then(function() {
        var url = "/mynovel#/welcome";
        $window.location.href = url;
     })
     .catch(function(err) {
        $scope.err = err.data;
     });
  };

}]);
