// Import mongoose
var mongoose = require("mongoose");

// Define a schema for contacts
var ContactSchema = new mongoose.Schema({
	contactOwner: {
		type: String
	},
	contactName: {
		type: String
	},
	contactNumber: {
		type: Number
	},
	messages: [{
		messageContent: String,
		dateTransmitted: Date
	}]
});


module.exports = mongoose.model("Contact", ContactSchema);
