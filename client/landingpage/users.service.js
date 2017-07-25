(function(){


angular.module("SimpleTextApp")
	.service("UsersService", [
		"$http", "API_BASE", "SessionToken", "CurrentUser",
		function($http, API_BASE, SessionToken, CurrentUser) {



			function UsersService(){};



			UsersService.prototype.create = function(user) {
				var userPromise = $http.post(API_BASE + "signup", {
					username: user.username,
					password: user.password
				});

				userPromise.then(function(response){
					SessionToken.set(response.data.sessionToken);
					CurrentUser.set(response.data._id);
				});
				return userPromise;
			};



			UsersService.prototype.login = function(user) {
				var loginPromise = $http.post(API_BASE + "login", {
					username: user.username,
					password: user.password
				});

				loginPromise.then(function(response){
					SessionToken.set(response.data.token);
					CurrentUser.set(response.data.user._id);
				});
				return loginPromise;
			};



			UsersService.prototype.logout = function() {
				CurrentUser.clear();
				SessionToken.clear();
			};



			UsersService.prototype.findContacts = function(user) {
				var contactsPromise = $http.get(API_BASE + "contacts");
				return contactsPromise;
			};



			UsersService.prototype.saveNewContact = function(name, number) {
				var saveNewContactPromise = $http.post(API_BASE + "contacts", {
					contactName: name,
					contactNumber: number
				});
				return saveNewContactPromise;
			};



			UsersService.contactToView;



			UsersService.prototype.saveUpdateContact = function(name, number, id) {
				var saveUpdateContactPromise = $http.put(API_BASE + "contacts/" + id, {
					contactName: name,
					contactNumber: number
				});
				return saveUpdateContactPromise;
			};



			UsersService.prototype.deleteContact = function(id) {
				var deleteContactPromise = $http.delete(API_BASE + "contacts/" + id);
				return deleteContactPromise;
			};



			UsersService.prototype.sendMessage = function(id, messageContent) {
				var sendMessagePromise = $http.post(API_BASE + "message/" + id, {
					messageContent: messageContent
				});
				return sendMessagePromise;
			};







			return new UsersService();

		}]);


		
})();  // end of wrapper IIFE