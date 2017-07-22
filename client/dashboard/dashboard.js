(function() {



angular.module("SimpleTextApp.dashboard", ["ui.router"])
	.config(dashboardConfig);





dashboardConfig.$inject = ["$stateProvider"];


function dashboardConfig($stateProvider) {

	$stateProvider
		.state("dashboard", {
			url: "/",
			templateUrl: "/dashboard/dashboard.html",
			controller: DashboardController,
			controllerAs: "ctrl",
			bindToController: this
		})

};







DashboardController.$inject = ["$state", "UsersService"];

function DashboardController($state, UsersService) {
	var vm = this;
	vm.currentUser = localStorage.getItem("currentUser");
	vm.currentUser = vm.currentUser.replace(/['"]+/g, '');
	vm.contacts = [];




	vm.saveNewContact = function() {
		UsersService.saveNewContact(vm.newContact.contactName, vm.newContact.contactNumber).then(function() {
			vm.fetchContacts();
		});
	};


	vm.fetchContacts = function() {
		UsersService.findContacts(vm.currentUser).then(function(response){
			vm.contacts = response.data;
		});
	};


	vm.viewContact = function(contactToView) {
		// Store the contact that we want to view in the UsersService, so we can grab it back out in the messageview
		UsersService.contactToView = contactToView;
		$state.go("messageview");
	};


	vm.logout = function() {
		UsersService.logout();
		$state.go("landing");
	};


	// On load, after declarations, automatically fetch our contacts
	vm.fetchContacts();

};












})();  // End of wrapper IIFE