var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var db = require('./models');
var session = require("express-session");

var app = express();
app.use(bodyParser.urlencoded({extended: true }));

var views = path.join(__dirname, "views");

app.use(session({
	secret: "SUPER STUFF",
	resave: false,
	saveUnintialized: true
}))


var loginHelpers = function (req, res, next) {

	req.login = function (user) {
		req.session.userId = user._id;
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

app.get('/', function (req, res) {
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
})

app.post('/login', function (req, res) {
	var user = req.body.user
	db.User.authenticate(user, function (err, user) {
		if (!err) {
			req.login(user);
			res.send(user);
			// res.redirect("/profile");
		} else {
			res.redirect("/login");
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

app.listen(3000, function (req, res) {
	console.log(3000);
});