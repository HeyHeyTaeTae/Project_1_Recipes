var mongoose = require('mongoose');
var notes = require("./notes");

var recipeSchema = new mongoose.Schema ({
					recipeId: { //id
						type: String,
						default: ""
					},
					ingredients: { //ingredientLines
						type: Array,
						default: []
					},
					time: { //totalTime
						type: String,
						default: ""
					},
					source: { //source
						//figure out how to add urls to models
					},
					numberOfServings: { //yield
						type: Number,
						default: 0
					},
					name: { //name
						type: String,
						default: ""
					},
					cuisine: { //attributes.cuisine
						type: String,
						default: ""
					},
					holiday: { //attributes.holiday
						type: String,
						default: ""
					},
					images: {
						//still need to figure out how to do urls
					},
					recipeNotes: [notes]


})
// <% partsOfRecipe.recipeNotes.notes.forEach(function (items) {%>
		// 	<li class="list-of-notes"><%= items %> </li>
		// <%}); %>

var Recipe = mongoose.model("Recipe", recipeSchema);
module.exports = Recipe;
