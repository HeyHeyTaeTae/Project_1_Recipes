var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var userSchema = new mongoose.Schema({
				email: {
					type: String,
					lowercase: true,
					required: true,
					index: {
						unique: true,
					}
				},
				passwordDigest: {
					type: String,
					required: true
				},
				firstName: {
					type: String,
					default: ""
				},
				lastName: {
					type: String,
					default: ""
				},
				//will store recipe ids
				favoritedRecipes: {
					type: Array,
					default: []
				}

				//need to be specific to my app
});

var confirm = function (password, passConfirm) {
	return password === passConfirm;
};

userSchema.statics.createSecure = function (params, cb) {
	var isConfirmed;
	//password_confirmation comes from the html form in library_app
	//signup.html or login.html
	isConfirmed = confirm(params.password, params.password_confirmation);

	if (!isConfirmed) {
		return cb("Passwords need to match!");
	}

	var that = this;
	bcrypt.hash(params.password, 12, function (err, hash) {
		params.passwordDigest = hash;
		that.create(params, cb);
	});
};

userSchema.statics.authenticate = function (params, cb) {
	this.findOne({email: params.email}, function (err, user) {
		user.checkPassword(params.password, cb);
	});
};

userSchema.methods.checkPassword = function (password, cb) {
	var user = this;
	bcrypt.compare(password, this.passwordDigest,
		function (err, isMatch) {
			if (isMatch) {
				cb(null, user);
			} else {
				cb("Whoopsie", null);
			}
		});
};

//userSchema.statics.is
var User = mongoose.model("User", userSchema);
module.exports = User;











