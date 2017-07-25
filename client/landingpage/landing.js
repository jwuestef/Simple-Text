(function() {



angular.module("SimpleTextApp.landing", ["ui.router"])
	.config(landingConfig);





landingConfig.$inject = ["$stateProvider"];


function landingConfig($stateProvider) {

	$stateProvider
		.state("landing", {
			url: "/",
			templateUrl: "/landingpage/landing.html",
			controller: LandingController,
			controllerAs: "ctrl",
			bindToController: this
		})

};







LandingController.$inject = ["$state", "UsersService"];

function LandingController($state, UsersService) {
	var vm = this;

	vm.user = {};
	vm.login = function() {
		UsersService.login(vm.login.user).then(function(response){
			$state.go("dashboard");
		});
	};

	vm.signup = function() {
		UsersService.create(vm.signup.user).then(function(response){
			$state.go("dashboard");
		});
	};



}












})();  // End of wrapper IIFE