var yummlyApiEndpoint = "https://api.yummly.com/v1";

$(document).ready(function () {
	$(".submit-search").on("click", function (event) {
		var searchQuery = $('.search').val();
		var runSearch(searchQuery, function() {

		})
	})


})

function runSearch(searchQuery, callback) {
	$.get(yummlyApiEndpoint, {
		_app_id: APP_ID,
		_app_key: APP_KEY, 
		q: searchQuery
	}, callback);		
}
	
