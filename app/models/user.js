var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
	local: {
		email: String,
		password: String,
	},
	feed: {
		friends: [String]
	},
	uName: String,
	portfoliovalue: [{}],
	cash: {type: Number, default: 100000}
},
{
	timestamps: true
});



//make a hash

userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//check for password validity

userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);