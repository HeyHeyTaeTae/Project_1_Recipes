var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var db = require('./models/index.js');
var session = require("express-session");

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
	req.isInDatabase = function (idOfRecipe, cb) {
		db.Recipe.findOne({recipeId:idOfRecipe}, cb)
	};
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
	console.log(newUser);
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

// TODO: This route should not be responsible for adding favorites to the
// current user. Just send back the recipe with the given id, or an 
// empty object if that recipe isn't found. Adding recipes to a user's
// favorites should be done in a separate route
app.get("/recipes/:id", function (req, res) {
	//find out if recipe is in the database
	//add to database if it is not
	//add id to user model
	var id = req.params.id;
	req.isInDatabase(id, function (err, result) {
		if (result){ //if found
			//use indexOf or the underscore method contains() 
			//to make sure the user doesn't add the same recipe twice
			res.send(req.params.id)
		} else { //add recipe to the database if not found
			//use _id
			res.send({});
		}
	});
});


app.post("/recipes", function (req, res) {
	console.log("creating")
	//console.log("req.body ", req.body);
	var recipeInfo = req.body;
	db.Recipe.create(recipeInfo, function (err, recipe) {
		console.log(recipe);
	});

})

app.post("/notes", function (req, res) {
	//the notes I send here
	//res.body, req.body, ect
	var newNote = req.body.notes.notes;
	req.currentUser(function (err, user) {
		db.Notes.create({notes: newNote, userOfNote: user},
		 function (err, note) {
		 	console.log(note);
		 })
	})
})
app.get("/favorites", function (req, res) {
	var favePath = path.join(views, "favorites.html");
	res.sendFile(favePath);
})

app.get("/users/favorites", function (req, res) {
	req.currentUser(function (err, user) {
		var recipeIds = user.favoritedRecipes;
		db.Recipe.find( { recipeId: { $in: recipeIds } }, function(err, recipes) {
			res.send(recipes);
		});
	})	
})

app.post("/users/favorites", function (req, res) {
	var recipeId = req.body.foodId;
	//console.log("req.body: ", req.body.foodId)
	req.currentUser(function (err, user) {
		user.favoritedRecipes.push(recipeId);
		user.save();
	})
	
})

app.get("/views/:id", function (req, res) {
	//console.log(req.params.id)
	var idOfRecipe = req.params.id;
	req.isInDatabase(idOfRecipe, function (err, recipe) {
		//console.log(recipe);
		res.send(recipe);
	});
	//res.send()
})

app.listen(3000, function (req, res) {
	console.log(3000);
});