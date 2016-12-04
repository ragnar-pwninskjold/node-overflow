var mongoose = require('mongoose');

var positionSchema = mongoose.Schema({
	ticker: String,
	volume: Number,
	entryPrice: Number,
	entryDate: Date,
	user: String, 
	name: String,
	sector: String,
	positionVal: [Number]
},
{
	timestamps: true
});




module.exports = mongoose.model('Positions', positionSchema);

