(function() {


// Keep only ONE functionality per file. This file will 'make' the angular app, pulling in all of our separate modules
angular.module("SimpleTextApp", [
	"ui.router",
	"SimpleTextApp.landing",
	"SimpleTextApp.dashboard",
	"SimpleTextApp.messageview"
])
.config(mainConfig)
.constant("API_BASE", "/");

// Inject the angular module to allow some basic routing here
mainConfig.$inject = ["$urlRouterProvider"];


// If none of our other modules handle the route, direct them to the landing page.
function mainConfig($urlRouterProvider) {
	$urlRouterProvider.otherwise("/");
};







})();  // End of wrapper IIFE