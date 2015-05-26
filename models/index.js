var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/Project_1");

module.exports.User = require("./user");
module.exports.Recipe = require("./recipes");