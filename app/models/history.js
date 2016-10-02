var mongoose = require('mongoose');

var historySchema = mongoose.Schema({
	ticker: String,
	orderType: String,
	volume: Number
},
{
	timestamps: true
});



module.exports = mongoose.model('History', historySchema);