(function() {



angular.module("SimpleTextApp.messageview", ["ui.router"])
	.config(messageviewConfig);





messageviewConfig.$inject = ["$stateProvider"];


function messageviewConfig($stateProvider) {

	$stateProvider
		.state("messageview", {
			url: "/",
			templateUrl: "/messageview/messageview.html",
			controller: MessageviewController,
			controllerAs: "ctrl",
			bindToController: this
		})

};







MessageviewController.$inject = ["$state", "UsersService"];

function MessageviewController($state, UsersService) {
	var vm = this;


	vm.thisContactName = UsersService.contactToView.contactName;
	vm.thisContactNumber = UsersService.contactToView.contactNumber;
	vm.thisContactMessages = UsersService.contactToView.messages;


	vm.saveUpdateContact = function() {
		var newContactName = document.getElementById("updateContactName").value;
		var newContactNumber = document.getElementById("updateContactNumber").value;
		UsersService.saveUpdateContact(newContactName, newContactNumber, UsersService.contactToView._id).then(function() {
			$state.go("dashboard");
		});
	};


	vm.deleteContact = function() {
		UsersService.deleteContact(UsersService.contactToView._id).then(function() {
			$state.go("dashboard");
		});
	};


	vm.sendMessage = function() {
		var newMessageContent = document.getElementById("newMessageContent").value;
		UsersService.sendMessage(UsersService.contactToView._id, newMessageContent).then(function() {
			$state.go("dashboard");
		});
	};


	vm.returnToDashboard = function() {
		$state.go("dashboard");
	};


	vm.logout = function() {
		UsersService.logout();
		$state.go("landing");
	};





};




})();  // End of wrapper IIFE