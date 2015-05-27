//TODO: make sure you require recipes
//in the models index.js
//recipe schema
var mongoose = require('mongoose');
//var bcrypt = require('bcrypt');

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
					}


})

// recipeSchema.statics.addToDatabase = function (recipeInfo, cb) {
// 	//console.log("this is in the recipe model");
// 	//console.log(recipeInfo.ingredients);
// 	// this.ingredients.push(recipeInfo.ingredients)
// 	this.create({recipeId: recipeInfo.recipeId,
// 	ingredients: recipeInfo.ingredients,
// 	time: recipeInfo.time, cuisine: recipeInfo.cuisine,
// 	holiday: recipeInfo.holiday, numberOfServings: recipeInfo. numberOfServings
// 	//will need to eventually add source and images
// 	}, cb);
	
// }

var Recipe = mongoose.model("Recipe", recipeSchema);
module.exports = Recipe;
