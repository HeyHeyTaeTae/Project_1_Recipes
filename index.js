var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var db = require('./models/index.js');
var session = require("express-session");

var app = express();
app.use(bodyParser.urlencoded({extended: true }));
app.use(express.static("public"));
app.use(express.static("bower_components"));

var views = path.join(__dirname, "public/views");

app.use(session({
	secret: "SUPER STUFF",
	resave: false,
	saveUnintialized: true
}))


var loginHelpers = function (req, res, next) {

	req.login = function (user) {
		req.session.userId = user.id;
		req.user = user;
		return user;
	};

	req.logout = function () {
		req.session.userId = null;
		req.user = null;
	};

	req.currentUser = function (cb) {
		var userId = req.session.userId;
		db.User.findOne({_id: userId}, cb);
	};

	next();
};

app.use(loginHelpers);

var faveHelpers = function (req, res, next) {
	var baseUrl = "https://api.yummly.com/v1";
	var API_KEY = "0d58d3705c115190fb2f3e9d89ed3547"
	var APP_ID = "2d5c41e5"
	req.isInDatabase = function (recipeId, cb) {
		//would it be _id?
		// console.log(db);
		db.Recipe.findById(recipeId, cb);
		return recipeId;
	};

	// req.addToDatabase = function (id) {
	// };
	next();
};
app.use(faveHelpers);

app.get('/', function (req, res) {
	// console.log(req.session.userId)
	// console.log(req.user)
	// console.log(req.currentUser())
	var homePath = path.join(views, "homePage.html");
	res.sendFile(homePath);
});

app.get("/signup", function (req, res) {
	var signupPath = path.join(views, "sign_up_page.html");
	res.sendFile(signupPath);
});

app.post("/users", function (req, res) {
	var newUser = req.body.user;
	db.User.createSecure(newUser, function (err, user) {
		if (user) {
			req.login(user);
			res.send(newUser);
			//res.redirect("/profile");
		} else {
			res.redirect("/signup");
		}
	});
});

app.get("/login", function (req, res) {
	var loginPath = path.join(views, "login.html");
	res.sendFile(loginPath);
});

app.post('/login', function (req, res) {
	var user = req.body.user
	db.User.authenticate(user, function (err, user) {
		console.log("here");
		if (!err) {
			req.login(user);
			// res.send(user);
			res.redirect("/");
		} else {
			res.redirect("/");
		}
	})
});

app.get("/profile", function (req, res) {
	var profilePath = path.join(views, "profile.html");
	res.sendFile(profilePath);
	req.currentUser(function (err, user) {
		if (!err) {
			res.send(user.email);
		} else {
			res.redirect("/login");
		}
	});
});

app.get("/logout", function (req, res) {
	req.logout();
	res.redirect("/");
	
});

app.get("/recipes/:id", function (req, res) {
	//find out if recipe is in the database
	//add to database if it is not
	//add id to user model
	var id = req.params.id;
	// console.log("food id", id);
	// console.log("faving a recipe!");
	//req.currentUser(function(err, user){console.log("current User", user)});
	req.isInDatabase(id, function (err, id) {
		console.log("params test", req.params.id);
		if(!err) { // if found
			req.currentUser(function (user) {
				console.log('no error');
				console.log("id", id);
				console.log("in db", user);
				user.favoritedRecipes.push(id);
			})
			// console.log('no error')
			// user.favoriteRecipes.push(id);
		} else { //add recipe to the database if not found
			//console.log('error');
			//console.log("params test 2", req.params.id)
			req.currentUser(function(err, user) {
				//console.log("id", id);
				
				user.favoritedRecipes.push(req.params.id);
				//console.log("not in db", user)
				user.save();
			})
			// add recipe to db
			// push to user favorites
			res.send({});
		}
	});
});

app.post("/recipes", function (req, res) {
	console.log("creating")
	Recipe.create(res.params)
})

app.listen(3000, function (req, res) {
	console.log(3000);
});