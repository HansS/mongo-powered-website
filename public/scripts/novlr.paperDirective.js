var novlr = require("./novlr");
var _ = require('lodash');

novlr.directive("nPaper", ["editorService", function (editorService) {
  return {
    restrict: "A",
    templateUrl: "/public/templates/npaper.html",
    scope: {
      chapter: "=ngModel"
    },
    controller: ["$scope", "$element", function($scope, $element) {
      // Initialise chapter on first load.
      if ($scope.chapter) {
        editorService.init($scope.chapter.text, $element, $scope);
      }
      // Respond to chapter change.
      $scope.$watch("chapter", function(newval, oldval) {
        // Get the chapter id from the Mongo object or chapter_id if retrieved from local storage.
        var new_id = newval? newval._id : null;
        var old_id = oldval? oldval._id : null;
        var new_text = newval? newval.text : null;
        var old_text = oldval? oldval.text : null;
        if (new_id != old_id || new_text != old_text) {
          var html = newval? newval.text : '';
          editorService.init(html, $element, $scope);
        }
      });
    }]
  };
}]);
