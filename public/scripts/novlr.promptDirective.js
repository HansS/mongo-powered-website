var novlr = require("./novlr");

novlr.directive('nPrompt', ['$modal', function ($modal) {
  return {
    restrict: 'A',
    scope: {
      'action': '&nPrompt',
      'data': '=nPromptData'
    },
    link: function(scope, elem, attrs) {
      elem.on('click', function() {
        var modalInstance = $modal.open({
          templateUrl: '/public/templates/nprompt.html',
          controller: ["$scope", "$modalInstance", "data",
          function($scope, $modalInstance, data) {
            $scope.data = data;
            $scope.ok = function () {
              $modalInstance.close($scope.value);
            };
            $scope.cancel = function () {
              $modalInstance.dismiss('cancel');
            };
            $scope.inputKeypress = function (keyEvent) {
              if (keyEvent.which === 13) {
                $(keyEvent.currentTarget).blur();
                $modalInstance.close($scope.value);
              }
            };
          }],
          resolve: {
            data: function () {
              return scope.data;
            }
          }
        });
        modalInstance
          .result
          .then(function (value) {
              scope.action({value:value});
            }, function () {
          });
      });
    }
  };
}]);
