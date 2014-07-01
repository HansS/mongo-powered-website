var novlr = require("./novlr");

novlr.config(["$routeProvider", function($routeProvider, storageServiceProvider) {
  
  // Configure existing providers
  $routeProvider
    .when("/settings", {
      templateUrl: "/public/templates/settings.html",
      controller: "settingsController"
    })
    .when("/welcome", {
      templateUrl: "/public/templates/welcome.html",
      controller: "welcomeController"
    })
    .otherwise({
      redirectTo: "/"
    });

}]);
