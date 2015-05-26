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
			var groupedSearchResults = [];
			//if you hit the search button twice,
			// it'll print the same results at the bottom
			for (var i = 0; i < Math.ceil(searchResults.length / 5); i++) {
				var group = [];
				for(var k = i * 5; k < (i * 5) + 5; k++){
					if (searchResults[k] !== undefined) {
						group.push(searchResults[k]);
					}
				}
				groupedSearchResults.push(group);
			}
			var resultsTemplate = $("#display-search-results").html();
			var compile = _.template(resultsTemplate);
			var putOnPage = compile({collection: groupedSearchResults});
			$("#search-wrapper").append(putOnPage);
		}, startNumber);
	});

	// var $loginForm = $("#login-form");
	// $loginForm.toggleClass("hidden");
	// $(".login-button").on("click", function (event){
	// 	$loginForm.toggle();
	// })



})

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
		// If my db doesn't have this recipe, 
		// fetch it from Yummly, and then use Yummly's
		// response to create it in my db
		debugger
		if (_.isEqual({}, res)) {
			debugger
			findAndCloneItemById(id);
			
		} 
	})
}

function findAndCloneItemById(recipeId) {
	console.log(recipeId);
	$.get(yummlyApiEndpoint + "recipe/", {
		recipe: recipeId,
		_app_id: APP_ID,
		_app_key: APP_KEY
	}).done(function(res) {
		var recipeInfo = {
			name: res.name, 
			id: res.id, 
			ingedients: res.ingredientLines,
			time: res.totalTime,
			cuisine: res.attributes.cuisine,
			holiday: res.attributes.holiday,
			source: res.source,
			images: res.images}
		$.post('/recipes/', recipeInfo);
	}).done(function(res) {
		// add the recipeId to the current user's favorites
	});

	
}

