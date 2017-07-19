// Declare the overall angular app
var simpleTextApp = angular.module('simpleTextApp', ['ngRoute']);


// This configures the routes and associates each route with a view and a controller
simpleTextApp.config(["$routeProvider", function ($routeProvider) {
	$routeProvider
		// Define base route
		.when('/', {
			controller: 'LandingController',
			templateUrl: '/views/landing.html'
		})
		// Define a route that has a route parameter in it (:userID) to load each user's dashboard (list of contacts)
		.when('/dashboard/:userID', {
			controller: 'DashboardController',
			templateUrl: '/views/dashboard.html'
		})
		// Define a route that has a route parameter in it (:conversation) to load a particular conversation (all messages with specific contact)
		.when('/conversation/:conversation', {
			controller: 'ConversationController',
			templateUrl: '/views/conversation.html'
		})
		.otherwise({ redirectTo: '/' });
}]);
