

// Import authorization middleware
var Auth = require("./controllers/auth");
// Import our bucket list functionality
var BucketList = require("./controllers/bucketlistcontroller");


// Import our passport authentication middleware
var passportService = require("./services/passport");
// Import passport functionality
var passport = require("passport");




// MIDDLEWARE
// By default the .authenticate method wants to make a cookie. 
// Since we’re using jwt, we don’t want a cookie. Hence, we set the first parameter to ‘jwt’ and the second to this: {session: false}.
var requireAuth = passport.authenticate("jwt", {session: false});
// Use the local strategy for logging in
var requireLogin = passport.authenticate("local", {session: false});




// ROUTING

module.exports = function(app) {

	app.post("/signup", Auth.signup);
	app.post("/login", requireLogin, Auth.login);
	
	app.post("/newitem", requireAuth, BucketList.addBucketList);
	app.get("/items", requireAuth, BucketList.fetchBucketLists);
	app.get("/items/:id", requireAuth, BucketList.fetchBucketList);
	app.put("/items/:id", requireAuth, BucketList.updateBucketList);
	app.delete("/items/:id", requireAuth, BucketList.deleteBucketList);

};