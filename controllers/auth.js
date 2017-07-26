
// Import the user model
var User = require("../models/user");

// Import JWT module and the secret
var jwt = require("jwt-simple");
var config = require("../config");

// Import Twilio module, and my account credentials via the config file
var accountSid = config.accountSid;
var authToken = config.authToken;
var client = require('twilio')(accountSid, authToken);




function createUserToken(user) {
	// Get the current time
	var timestamp = new Date().getTime();
	// Using JSON Web Token package, we encode the user's id and the issued-at timestamp, encoded/mixed with the secret.
	return jwt.encode({sub: user.id, iat: timestamp}, config.secret);
};




function generateTwilioPhoneNumber(next) {

	// Initialize blank variable
	var phoneNumber = "";

	// Search for available numbers that have SMS capabilities
	client.availablePhoneNumbers("US").local.list({
		SmsEnabled: "true"
	}, function(err, data) {
		// Pull the phone number out of the response
		phoneNumber = data[0].phoneNumber;
		// Purchase this number, set the smsURL so it will send a POST request to our server when the number receives a text message
					// client.incomingPhoneNumbers.create({
					// 	phoneNumber: phoneNumber,
					// 	SmsMethod: "POST",
					// 	smsUrl: "https://simple-text.herokuapp.com/receiveMessage"
					// }, function(err, purchasedNumber) {
					// 	// purchasedNumber is the full phone number documentation, with account info and everything
					// 	var actualPhoneNumber = purchasedNumber.phoneNumber;
					// 	next(null, actualPhoneNumber);
					// });

		next(err, phoneNumber);  // For skipping the actual purchase - uncomment above - I've already bought 1-224-412-3145
	});
}




exports.signup = function(req, res, next) {


	// Pull variables out of the signup request
	var username = req.body.username;
	var password = req.body.password;

	// Make sure both fields are filled in
	if(!username || !password) {
		return res.status(400).send({error: "You must provide both and username and password"});
	};

	// Goes through the database attempting to find one instance of a specific username. 
	// So it will look through all users and see if a user with the given username exists.
	User.findOne({username: username.toLowerCase()}, function(err, foundExistingUser) {

		if(err) {
			return next(err);
		};

		if(foundExistingUser) {
			return res.status(409).send("Username is already in use");   // status 409 is "conflict"
		};

		// Generate a new phone number for this new user
		generateTwilioPhoneNumber(function(err, generatedPhoneNumber) {
			if(err) {
				console.log("Error generating / purchasing phone number!");
				console.log(err);
			} else {
				//console.log("generatedPhoneNumber is:");
				//console.log(generatedPhoneNumber);

				// Create a new user with said information
				var newUser = {
					username: username,
					password: password,
					phoneNumber: generatedPhoneNumber
				};

				// Saves the new user to the database
				User.create(newUser, function(err, savedNewUser) {
					if(err) {
						return next(err);
					};

					// User successfully created - return a valid JWT created with our function above
					// First find our new user so we can pass the ID back through the response too
					var idToSaveToLocalStorage = savedNewUser._id.valueOf();
					User.findOne({username: savedNewUser.username.toLowerCase()}, function(err, foundCreatedUser) {
						if(err) {
							return next(err);
						};
						// Send back a token and the user's id
						res.json({token: createUserToken(foundCreatedUser), _id: idToSaveToLocalStorage});
					});

				});





			};

		});


	});


}




exports.login = function(req, res, next) {

	// User has already had their username and password authenticated
	// We just need to give them a token
	res.send({token: createUserToken(req.user), user: req.user});
	
};

