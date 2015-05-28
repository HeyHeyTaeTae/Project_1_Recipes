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
						type: Object,
						default: {}
					},
					numberOfServings: { //yield
						type: String,
						default: ""
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
						type: Array,
						default: []
					},
					recipeNotes: [notes]


})
// <% partsOfRecipe.recipeNotes.notes.forEach(function (items) {%>
		// 	<li class="list-of-notes"><%= items %> </li>
		// <%}); %>

var Recipe = mongoose.model("Recipe", recipeSchema);
module.exports = Recipe;
