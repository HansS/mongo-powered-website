var novlr = require("./novlr");

novlr.directive('nConfirm', ['$modal', function($modal) {
  return {
    restrict: 'A',
    scope: {
      'action': '&nConfirm',
      'data': '=nConfirmData'
    },
    link: function(scope, elem, attrs) {
      elem.on('click', function($event) {
        $event.stopImmediatePropagation();
        var modalInstance = $modal.open({
          templateUrl: '/public/templates/nconfirm.html',
          controller: ["$scope", "$modalInstance", "text", function($scope, $modalInstance, text) {
            $scope.data = scope.data;
            $scope.ok = function () {
              $modalInstance.close(/*$scope.text*/);
            };
            $scope.cancel = function () {
              $modalInstance.dismiss('cancel');
            };
          }],
          resolve: {
            text: function () {
              return scope.text;
            }
          }
        });
        modalInstance.result.then(function (/*text*/) {
          scope.action();
        }, function () {
        });
      });
    }
  };
}]);