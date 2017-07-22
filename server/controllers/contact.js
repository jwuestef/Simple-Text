
// Import the Contact and User models (which is built via schema), so we can interact with both collections in MongoDB
var Contact = require("../models/contact");
var User = require("../models/user");

// Import Twilio module, and my account credentials via the config file
var config = require("../config");
var accountSid = config.accountSid;
var authToken = config.authToken;
var client = require('twilio')(accountSid, authToken);




// Get all contacts for a specific user
exports.getContacts = function(req, res) {

	// Pull the user info from the request
	var userId = req.user._id;

	Contact.find({contactOwner: userId}, function(err, foundContacts) {
		if(err) {
			console.log(err);
			res.json(err);
		} else {
			if(!foundContacts) {
				res.send({message: "This user doesn't have any contants!"});
			} else {
				res.send(foundContacts);
			};
		};
	});

};




// Add a contact to the DB
exports.addContact = function(req, res) {

	// Pull the information for this new contact out of the request
	var contactOwner = req.user._id;
	var contactName = req.body.contactName;
	var contactNumber = req.body.contactNumber;

	// Create a new instance of the Contact model and set the properties
	var newContact = new Contact({
		contactOwner: contactOwner,
		contactName: contactName,
		contactNumber: contactNumber
	});

	// Save the contact to the DB and check for errors
	newContact.save(function(err) {
		if(err) {
			console.log("Error in newContact.save method, under .addContact, in file controllers/contact.js");
			console.log(err);
			res.json(err);
		};
		// If we make it here, it didn't error out. Successful contact creation - send back the new contact info, complete with ObjectID and all
		res.json(newContact);
	});

};




// Update the contact with the given id
exports.updateContact = function(req, res) {

	// Find the contact in the DB
	Contact.findById(req.params.contactId, function(err, foundContact) {
		if(err) {
			console.log(err);
			res.json(err);
		} else {
			// See if the requesting user owns the contact. If not, must be a hacker using Postman! As long as they match, continue.
			if(req.user._id.valueOf() == foundContact.contactOwner.valueOf()) {
				// Find the contact via the ID parameter passed in via URL route parameter. Update these two fields with the info from the PUT request parameters.
				Contact.findByIdAndUpdate(req.params.contactId, 
				{$set: { contactName: req.body.contactName, contactNumber: req.body.contactNumber } }, function(err, updatedContact) {
					if (err) {
						console.log(err);
						res.json(err);
					} else {
						// Returning the updatedContact just returns old contact info, but it HAS been updated to the DB. Make a new request to verify update
						Contact.findById(updatedContact._id, function(err, foundContact) {
							res.json(foundContact);
						});
					};
				});
			} else {  // User does NOT own contact, Postman hacker detected!
				res.json({message: "You don't own that contact!"})
			};  // End of if(user = owner) statement
		};
	});

};




// Delete the contact with the given id
exports.deleteContact = function(req, res) {

	// Find the contact in the DB
	Contact.findById(req.params.contactId, function(err, foundContact) {
		if(err) {
			console.log(err);
			res.json(err);
		} else {
			// See if the requesting user owns the contact. If not, must be a hacker using Postman! As long as they match, continue.
			if(req.user._id.valueOf() == foundContact.contactOwner.valueOf()) {
				// Find the contact and delete it
				Contact.findByIdAndRemove(req.params.contactId, function(err, deletedContact) {
					if (err) {
						console.log(err);
						res.json(err);
					} else {
						res.json({message: "Contact removed"});
					};
				});
			} else {  // User does NOT own contact, Postman hacker detected!
				res.json({message: "You don't own that contact!"})
			};  // End of if(user = owner) statement
		};
	});

};




exports.sendMessageToUser = function(req, res) {

	// Find the contact in the DB
	Contact.findById(req.params.contactId, function(err, foundContact) {
		if(err) {
			console.log(err);
			res.json(err);
		} else {
			// See if the requesting user owns the contact. If not, must be a hacker using Postman! As long as they match, continue.
			if(req.user._id.valueOf() == foundContact.contactOwner.valueOf()) {
				// Pull the current authenticated user's phone number out of the request parameters
				// Use the foundContact's contactNumber as the destination for the text
				// Look in the request body for the messageContent
				var fromNumber = "+" + req.user.phoneNumber;
				var toNumber = "+" + foundContact.contactNumber;
				var messageContent = req.body.messageContent

				// Use Twilio to send a text message with the above parameters.
				client.messages.create({
					from: fromNumber,
					to: toNumber,
					body: messageContent
				}, function(err, message) {
					if(err) { 
						console.log("Error buying phone number!");
						console.log(err);
						res.json(err) ;
					} else {
						// No Twilio error kicked off on my end

						// Add this message to the database
						Contact.findByIdAndUpdate(req.params.contactId, {$push: {messages: {messageContent: messageContent, dateTransmitted: Date.now()}} }, function(err, messagedContact) {
							if (err) {
								console.log(err);
								res.json(err);
							} else {
								// Returning the messagedContact just returns old contact info, but it HAS been updated to the DB. Make a new request to verify update
								Contact.findById(messagedContact._id, function(err, updatedContact) {
									res.json(updatedContact);
								});
							};
						});

					};
				});
			} else {  // User does NOT own contact, Postman hacker detected!
				res.json({message: "You don't own that contact!"})
			};  // End of if(user = owner) statement
		};
	});

};




exports.receiveMessage = function(req, res) {

	// Pull our user's phone number out of the request, and take off the + sign from the front so we can search for it in Mongo
	var userNumber = req.body.To;
	userNumber = userNumber.slice(1);

	// We need to search MongoDB to find the user who owns this number, and get that _id
	User.find({phoneNumber: userNumber}, function(err, foundUser) {
		if(err) {
			console.log(err);
			res.json(err);
		} else {
			if(!foundUser) {
				console.log("No user has that phone number assigned!");
				res.json({message: "No user has that phone number assigned!"});
			} else {
				// We found the user, this is their ObjectId number:
				var foundUserId = foundUser[0]._id.toString();

				// Find the sender's phone number, again removing the leading +
				var fromNumber = req.body.From;
				fromNumber = fromNumber.slice(1);

				// Now let's find the specific contact who sent this message.
				// We can't just look for the sender's phone number (though we will need that) because the sender might be on multiple user's contact lists
				// We will have to look for a Contact that has both the sender's phone number AND one that has the contactOwner equaling the foundUserId

				// Pull message content out of request
				var messageContent = req.body.Body;
				console.log(messageContent);

				// Add this message to the database
				Contact.findOneAndUpdate({ $and: [ {contactNumber: fromNumber}, {contactOwner: foundUserId} ] }, {$push: {messages: {messageContent: messageContent, dateTransmitted: Date.now()}} }, function(err, messagedContact) {
					if(err) { 
						console.log(err);
						res.json(err);
					} else {
						if(!messagedContact) {
							res.json({message: "No such contact exists! Couldn't validate combination of sender's contact phoneNumber and ownerContact of the user!"});
						} else {
							// We found the right contact!
							// Now add it to the messages array.
							console.log("Matching contact updated! (probably out of date here)");
							console.log(messagedContact);
							console.log(messagedContact.messages);
							res.json({message: "Message successfully saved to DB!"});

						};
					};
				});

			};

		};

	});


};


