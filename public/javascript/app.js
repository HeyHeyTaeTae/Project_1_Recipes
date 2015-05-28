var yummlyApiEndpoint = "https://api.yummly.com/v1/api/"; //used to have recipes? at end
var APP_KEY = "0d58d3705c115190fb2f3e9d89ed3547";
var APP_ID = "2d5c41e5";
var searchResults;
var startNumber = 0;
$(document).ready(function () {
	$(".submit-search").on("click", function (event) {
		var searchQuery = $('.search').val();
		runSearch(searchQuery, function(data) {
			var searchResults = data.matches;
			var groupedSearchResults = sortResults(searchResults)
			var resultsTemplate = $("#display-search-results").html();
			var compile = _.template(resultsTemplate);
			var putOnPage = compile({collection: groupedSearchResults});
			$("#results-wrapper").html(putOnPage);
		}, startNumber);
	});

	// var $loginForm = $("#login-form");
	// $loginForm.toggleClass("hidden");
	// $(".login-button").on("click", function (event){
	// 	$loginForm.toggle();
	// })

	// TODO: This is not the right way to do this
	$('#show-faves').on('click', function() {
		viewFavorites();
	})

})

function sortResults(data) {
	var groupedResults = [];
	for (var i = 0; i < Math.ceil(data.length / 5); i++) {
		var group = [];
		for(var k = i * 5; k < (i * 5) + 5; k++){
			if (data[k] !== undefined) {
				group.push(data[k]);
			}
		}
		groupedResults.push(group);
	}
	return groupedResults
}

function runSearch(searchQuery,callback, startNumber) {
	if(startNumber === undefined) {
		startNumber = 0;
	}
	$.get(yummlyApiEndpoint + "recipes?", {
		_app_id: APP_ID,
		_app_key: APP_KEY, 
		q: searchQuery,
		maxResult: 30,
		start: startNumber
	}, callback);		
}
	
	
function addToFavorites(recipeButton){
	var id = $(recipeButton).data().id;
	$.get('/recipes/' + id).done(function(res) {
		var foodId = $(recipeButton).data().id;
		console.log(foodId);
		$.post("/users/favorites", {
			foodId: foodId
		});
		// If my db doesn't have this recipe, 
		// fetch it from Yummly, and then use Yummly's
		// response to create it in my db
		if (_.isEqual({}, res)) {
			//var recipe = findItemById(id);
			//cloneItemById(recipe);
			findAndCloneItemById(id);
		} 
	})
}

function findItemById(recipeId, cb) {
	$.get(yummlyApiEndpoint + "recipe/" + recipeId + "?", {
		_app_id: APP_ID,
		_app_key: APP_KEY
	}).done(function(res) {
		createItemById(res,cb);

	})
}

function createItemById(recipe,cb) {
	var recipeInfo = {
		name: recipe.name, 
		recipeId: recipe.id, 
		ingredients: recipe.ingredientLines,
		time: recipe.totalTime,
		numberOfServings: recipe.yield,
		cuisine: recipe.attributes.cuisine,
		holiday: recipe.attributes.holiday,
		source: recipe.source,
		images: recipe.images}
		console.log("create item by id: ", recipeInfo);
		cb(recipeInfo);
	// $.post('/recipes/:id/views', recipeInfo).done(function(res) {
	// // add the recipeId to the current user's favorites
	// });
}
function findAndCloneItemById(recipeId) {
	$.get(yummlyApiEndpoint + "recipe/" + recipeId + "?", {
		_app_id: APP_ID,
		_app_key: APP_KEY
	}).done(function(res) {
		var recipeInfo = {
			name: res.name, 
			recipeId: res.id, 
			ingredients: res.ingredientLines,
			time: res.totalTime,
			numberOfServings: res.yield,
			cuisine: res.attributes.cuisine,
			holiday: res.attributes.holiday,
			//source: res.source,
			images: res.images}
			console.log(recipeInfo);
		$.post('/recipes/', recipeInfo);
	}).done(function(res) {
		// add the recipeId to the current user's favorites
	});
}

function viewFavorites() {
	$.get("/users/favorites", function (res) {
		console.log(res);
		renderFavorites(res);
	})
}
// function viewFavorites() {
// 	// TODO: Function here should not be responsible for redirecting and 
// 	// loading data. Backend is responsible for redirects, and then on 
// 	// the new page load, make the request for the data. 
// 	$.get("/favorites", function (res) {
// 		console.log(res);
// 	}).done(
// 		$.get("/users/favorites", function (res) {
// 			renderFavorites(res);	
// 		})

function renderFavorites(faves) {
	var arrayOfFaves = sortResults(faves);
	var faveTemplate = $("#display-faves").html();
	var compile = _.template(faveTemplate);
	var favesOnPage = compile({collection: arrayOfFaves});
	$("#results-wrapper").html(favesOnPage);
}


function viewRecipe (recipeViewButton) {
	var id = $(recipeViewButton).data().id;
	$.get("/recipes/" + id).done(function (res) {
		if (_.isEqual({}, res)) {
			//var recipeId = $(recipeViewButton).data().id;
			findItemById(id, function (recipe) {
				console.log("if recipe is not in db: ", recipe);
				recipeTemplate(recipe);
			});
		} else {
			var recipeId = $(recipeViewButton).data().id;
			$.get("/views/" + recipeId).done(function (res) {
				console.log("if recipe is in db: ", res);
				recipeTemplate(res);
			})
		}
	})
}

function recipeTemplate (recipe) {
	var recipeTemp = $("#display-recipe").html();
	var compile = _.template(recipeTemp);
	console.log("recipe: ", recipe);
	var recipeLayout = compile({partsOfRecipe: recipe});
	$("#results-wrapper").html(recipeLayout);
}

function addNotes (noteButton) {
	var $id = $(noteButton).data().id;
	console.log($id);
	// $.get("/recipes/" + id).done(function (res) {
	// 	if (_.isEqual({}, res)) {
	// 		alert("you need you fave the recipe first!");
	// 		}
	// 	} else {
	// 		$.get("/notes", ).done(function (res) {
	// 			console.log("if recipe is in db: ", res);
	// 			recipeTemplate(res);
	// 		})
	// 	}
	// })
}



