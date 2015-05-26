var REPL = require("repl");
var db = require("./index.js");

var repl = REPL.start("> ");
repl.context.db = db;

repl.on("exit", function () {
  console.log("Ciao");
  process.exit();
})