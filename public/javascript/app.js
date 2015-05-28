
var searchResults;
var startNumber = 0;

$(document).ready(function () {
	$(".see-more-results").toggle()
	$(".submit-search").on("click", function (event) {
		startNumber = 0;
		searchForRecipes(startNumber);
		$(".see-more-results").toggle()
		
	});

	// var $loginForm = $("#login-form");
	// $loginForm.toggleClass("hidden");
	// $(".login-button").on("click", function (event){
	// 	$loginForm.toggle();
	// })

	// TODO: This is not the right way to do this
	// $(".login-button").on("click", function() {
	// 	$.get("/login");
	// })

	// $(".signup-button").on("click")

	$('#show-faves').on('click', function() {
		viewFavorites();
	})

	$(".see-more-results").on("click", function () {
		startNumber += 30;
		console.log("hello from more results button");
		searchForRecipes(startNumber);
	})

	$(".logout").on("click", function () {
		$.get("/logout");
	})

})

function searchForRecipes (startNumber) {
	var searchQuery = $('.search').val();
	runSearch(searchQuery, function(data) {
		var searchResults = data.matches;
		var groupedSearchResults = groupResults(searchResults)
		var resultsTemplate = $("#display-search-results").html();
		var compile = _.template(resultsTemplate);
		var putOnPage = compile({collection: groupedSearchResults});
		$("#results-wrapper").html(putOnPage);
	}, startNumber);
}

// Takes an array of data and returns an array of groups of data, each of the specified size
function groupResults(data, groupSize) {
	groupSize = groupSize || 5;
	var groupedResults = [];
	for (var i = 0; i < Math.ceil(data.length / groupSize); i++) {
		var group = [];
		for(var k = i * groupSize; k < (i * groupSize) + groupSize; k++){
			if (data[k] !== undefined) {
				group.push(data[k]);
			}
		}
		groupedResults.push(group);
	}
	return groupedResults;
}

function runSearch(searchQuery, callback, startNumber) {
	console.log("start number: ", startNumber)
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
	
// The Fave button contains the id of the recipe we want to add to the user's favorites
function addToFavorites(faveButton){
	console.log(faveButton);
	var recipeId = $(faveButton).data().id;
	$.get("/users/check"). done(function (res) {
		if (res) {
			$.get('/recipes/' + recipeId).done(function(res) {
				console.log("in add to favorites: ", recipeId);
				$.post("/users/favorites", {
					recipeId: recipeId
				});
				// If my db doesn't have this recipe, 
				// fetch it from Yummly, and then use Yummly's
				// response to create it in my db
				if (_.isEqual({}, res)) {
					findAndCloneRecipeById(recipeId);
				} 
			})
		} else {
			alert("You need to be logged in to do that!");
		}
	})
}

// Fetches the recipe with the given ID from Yummly's API, and then converts it 
// into a form for this app. 
// Note that if we this is given a recipe ID that is not in my database, it does not
// add it to the database. 
function fetchYummlyRecipeById(recipeId, cb) {
	$.get(yummlyApiEndpoint + "recipe/" + recipeId + "?", {
		_app_id: APP_ID,
		_app_key: APP_KEY
	}).done(function(res) {
		createRecipeData(res,cb);
	});
}


function createRecipeData(yummlyRecipeData, cb) {
	var recipeInfo = stripYummlyResponseData(yummlyRecipeData);
	console.log("create item by id: ", recipeInfo);
	cb(recipeInfo);
}

// Yummly's response has far more data than we need. This only keeps the data we need.
function stripYummlyResponseData(yummlyRecipeData) {
	return {
		name: yummlyRecipeData.name, 
		recipeId: yummlyRecipeData.id, 
		ingredients: yummlyRecipeData.ingredientLines,
		time: yummlyRecipeData.totalTime,
		numberOfServings: yummlyRecipeData.yield,
		cuisine: yummlyRecipeData.attributes.cuisine,
		holiday: yummlyRecipeData.attributes.holiday,
		source: yummlyRecipeData.source,
		images: yummlyRecipeData.images
	};
}

// Fetches a recipe from Yummly's API, clones it, and adds it to the database
function findAndCloneRecipeById(recipeId) {
	// TODO: Do not repeat code for fetching recipe from Yummly API. Use a helper
	$.get(yummlyApiEndpoint + "recipe/" + recipeId + "?", {
		_app_id: APP_ID,
		_app_key: APP_KEY
	}).done(function(res) {
		var recipeInfo = stripYummlyResponseData(res);
		$.post('/recipes/', recipeInfo);
	});
}

function viewFavorites() {
	$.get("/users/favorites").done(function (res) {
		if (_.isEqual({}, res)) {
			alert("You need to be logged in to do that!");
		} else {
			renderFavorites(res);
		}
	})
}

function renderFavorites(faves) {
	var arrayOfFaves = groupResults(faves);
	var faveTemplate = $("#display-faves").html();
	var compile = _.template(faveTemplate);
	var favesOnPage = compile({collection: arrayOfFaves});
	$("#results-wrapper").html(favesOnPage);
}


// First check if the recipe is in the database. If so, render it. Otherwise, fetch from 
// Yummly, and then render the response
function viewRecipe (recipeViewButton) {
	var recipeId = $(recipeViewButton).data().id;
	$.get("/recipes/" + recipeId).done(function (res) {
		if (_.isEqual({}, res)) {
			fetchYummlyRecipeById(recipeId, function (recipe) {
				renderRecipe(recipe);
			});
		} else {
			renderRecipe(res);
		}
	})
}

function renderRecipe (recipe) {
	var recipeTemplate = $("#display-recipe").html();
	var compile = _.template(recipeTemplate);
	console.log("recipe: ", recipe);
	var recipeLayout = compile({recipe: recipe});
	$("#results-wrapper").html(recipeLayout);
}

function removeFromFaves (deleteButtonData) {
	var recipeId = $(deleteButtonData).data().id;
	console.log("remove from faves recipeId: ", recipeId);
			  $.ajax({
			    url: '/users/favorites/' + recipeId,
			    type: 'DELETE',
			    success: function(res) {
			      // once successfull, re-render all phrases
			      viewFavorites();
			    }
			  })
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
	// 			renderRecipe(res);
	// 		})
	// 	}
	// })
}



