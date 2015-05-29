var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var db = require('./models/index.js');
var session = require("express-session");
var env = process.env;
var api_key = env.APP_KEY
var api_id = env.APP_ID

var app = express();
app.use(bodyParser.urlencoded({extended: true }));
app.use(bodyParser.json())
app.use(express.static("public"));
app.use(express.static("bower_components"));

var views = path.join(__dirname, "public/views");

app.use(session({
	secret: "SUPER STUFF",
	resave: false,
	saveUnintialized: true
}));

app.get("/apiInfo", function (req, res) {
	console.log("check id: ", api_id);
	console.log("check key: ", process.env.APP_KEY)
	var api_object = {id: api_id, key: api_key};
	console.log(api_object)
	res.send(api_object);
})

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
	req.isInDatabase = function (idOfRecipe, cb) {
		db.Recipe.findOne({recipeId:idOfRecipe}, cb)
	};
	next();
};
app.use(faveHelpers);

app.get('/', function (req, res) {	
	req.currentUser(function (err, user) {
		if (user) {
			var homePath = path.join(views, "homePage.html");
			res.sendFile(homePath);
		} else {
			res.redirect("/login");
		}
	});
	
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
			res.redirect("/");
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
		if (!err) {
			req.login(user);
			res.redirect("/");
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
	res.redirect("/login");
	
});

app.get("/recipes/:id", function (req, res) {
	//find out if recipe is in the database
	//add to database if it is not
	//add id to user model
	var id = req.params.id;
	req.isInDatabase(id, function (err, result) {
		if (result){ //if found
			//use indexOf or the underscore method contains() 
			//to make sure the user doesn't add the same recipe twice
			res.send(result);
		} else { //add recipe to the database if not found
			res.send({});
		}
	});
});

//works some of the time
app.post("/recipes", function (req, res) {
	var recipeInfo = req.body;
	db.Recipe.create(recipeInfo, function (err, recipe) {
		res.send(recipe);
	});
});

app.get("/users/check", function (req, res) {
	req.currentUser(function (err, user) {
		if (user !== null) {
			res.send(true);
		} else {
			res.send(false);
		}
	});
});

app.get("/users/favorites", function (req, res) {
	req.currentUser(function (err, user) {
		if (user === null) {
			res.send({});
		} else {
			var recipeIds = user.favoritedRecipes;
			db.Recipe.find( { recipeId: { $in: recipeIds } }, function(err, recipes) {
				res.send(recipes);
			});
		}
		
	})	
})

app.post("/users/favorites", function (req, res) {
	var recipeId = req.body.recipeId;
	req.currentUser(function (err, user) {
		if (user === null) {
			res.send({});
		} else {
			var favoritedRecipes = user.favoritedRecipes;
			// Only add the recipe to the user's favorites if it isn't there already
			if (favoritedRecipes.indexOf(recipeId) === -1) {
				favoritedRecipes.push(recipeId);	
			}
			user.save();
		}
	})
	
})

app.delete("/users/favorites/:id", function (req, res) {
	req.currentUser(function (err, user) {
		var index = user.favoritedRecipes.indexOf(req.params.id);
		user.favoritedRecipes.splice(index, 1);
		user.save();
		res.sendStatus(204);
	})
});

app.listen(process.env.PORT ||3000, function (req, res) {

});