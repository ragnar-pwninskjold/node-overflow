var mongoose = require('mongoose');

var historySchema = mongoose.Schema({
	name: String,
	orderType: String, //buy or sell
	volume: Number,
	user: String,
	entryPrice: Number,
	posId: String
},
{
	timestamps: true
});



module.exports = mongoose.model('History', historySchema);