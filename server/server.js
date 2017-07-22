
// REQUIRING MODULES
// ==================================================

var express = require("express");
var http = require("http");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cors = require("cors");

// Import authorization middleware
var Auth = require("./controllers/auth");
// Import our bucket list functionality
var Contact = require("./controllers/contact");


// PASSPORT
// Import our passport authentication middleware
var passportService = require("./services/passport");
// Import passport functionality
var passport = require("passport");
// By default the .authenticate method wants to make a cookie. 
// Since we’re using jwt, we don’t want a cookie. Hence, we set the first parameter to ‘jwt’ and the second to this: {session: false}.
var isAuthenticated = passport.authenticate("jwt", {session: false});
// Use the local strategy for logging in
var requireLogin = passport.authenticate("local", {session: false});


// This variable will allow us to access all the good things express has to offer and create an instance of express.
var app = express();




// DATABASE CONNECTION
// ==================================================

// DB connection
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/simpletext");

// DB connection events
	// When successfully connected
	mongoose.connection.on("connected", function () {  
		console.log("Mongoose connected to database");
	}); 

	// If the connection throws an error
	mongoose.connection.on("error",function (err) {  
		console.log("Mongoose default connection error: " + err);
	}); 

	// When the connection is disconnected
	mongoose.connection.on("disconnected", function () {  
		console.log("Mongoose default connection disconnected"); 
	});

	// If the Node process ends, close the Mongoose connection 
	process.on("SIGINT", function() {  
		mongoose.connection.close(function () { 
			console.log("Mongoose default connection disconnected through app termination"); 
			process.exit(0); 
		}); 
	}); 




// MIDDLEWARE
// ==================================================

// Cors is a middleware on the Express side. This is going to allow users to make requests from other ports and domains.
app.use(cors());

// BodyParser is used for parsing incoming JSON requests. Remember that JSON comes in as one humongous string. 
// BodyParser helps take it out of that stringified format and puts it into parsed code.
// This will let us get the data from a POST
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static("../client"));




// ROUTING
// ==================================================

app.get("/", function(req, res) {
	res.sendFile("/index.html");
});

app.post("/signup", Auth.signup);
app.post("/login", requireLogin, Auth.login);
app.get("/logout", function(req, res) {
	req.logout();
	res.redirect("/");
});

app.get("/contacts", isAuthenticated, Contact.getContacts);
app.post("/contacts", isAuthenticated, Contact.addContact);
app.put("/contacts/:contactId", isAuthenticated, Contact.updateContact);
app.delete("/contacts/:contactId", isAuthenticated, Contact.deleteContact);


app.post("/message/:contactId", isAuthenticated, Contact.sendMessageToUser);
app.post("/receiveMessage", Contact.receiveMessage);




// SERVER STARTUP
// ==================================================

// If there's an environment variable defined, use it. If not, use 3000.
var port = process.env.port || 3000;

// The http library is a native node library and is used for low level http requests. This line creates a node server.
// We can pass in our express app into the createServer function express application by passing in the app variable from above.
var server = http.createServer(app);

// Get our server to listen to any requests from the outside world. 
// We’ll add the console message to say that the server is up and running.
server.listen(port, function() {
	console.log("Server listening on port " + port);
});