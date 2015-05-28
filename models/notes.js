var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var notesSchema = new mongoose.Schema ({
					notes: {
						type: Array,
						default: []
					},
					userOfNote: {
						type: Schema.Types.ObjectId,
						ref: "User"
					}
	})
var Notes = mongoose.model("Notes", notesSchema);
module.exports = notesSchema;