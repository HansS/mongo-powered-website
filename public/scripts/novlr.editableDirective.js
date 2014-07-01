var novlr = require("./novlr");

novlr.directive("nEditable", ["$timeout", function($timeout) {
    return {
      restrict: "A",
      replace: true,
      templateUrl: "/public/templates/neditable.html",
      link: function(scope, elem, attrs) {},
      scope: {
        value: "=ngModel",
        save: "&nEditable"
      },
      controller: ["$scope", function($scope) {
          $scope.edit = function() {
            $scope.editing = true;
            $scope.$emit("edit");
          };
          $scope.view = function() {
            $scope.editing = false;
          };
          $scope.cancel = function() {
            $scope.inputValue = $scope.value;
            $scope.view();
          };
          $scope.submit = function(val) {
            $scope.value = val;
            $scope.save({
              value: val
            });

            $scope.view();
          };
          $scope.cancel();
          $scope.$watch('value', function(newval, oldval) {
            if ((!!newval) && (newval !== oldval)) {
              $scope.cancel();
            }
          });
      }],
      compile: function(element, attrs, transclude) {
        return function(scope, element, attrs) {
          scope.$on('edit', function() {
            $timeout(function() {
              element.find('input')[0].select();
            }, 0);
          });
          element.bind("keydown", function(event) {
            switch (event.keyCode) {
              case 13:
                scope.$apply(function() {
                  if (event.target.value) {
                    scope.submit(event.target.value);
                  }
                });
                event.preventDefault();
                break;
              case 27:
                scope.$apply(function() {
                  scope.cancel();
                });
                event.preventDefault();
                break;
              default:
                break;
            }
          });
        };
      }
    };
}]);