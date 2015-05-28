var mongoose = require("mongoose");
mongoose.connect(process.env.MONGOLAB_URI ||
               process.env.MONGOHQ_URL || "mongodb://localhost/Project_1");

module.exports.User = require("./user");
module.exports.Recipe = require("./recipes");
module.exports.Notes = require('./notes')