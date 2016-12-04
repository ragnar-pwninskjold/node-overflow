var mongoose = require('mongoose');

var companySchema = mongoose.Schema({
	ticker: String,
	name: String,
	price: Number,
	priceTime: Date,
	timeSeries:[{}],
	ratios:[Number],
	change: Number,
	news:[{}],
	sector: String,
	description: String,
	exchange: String,
	ceo: String,
	address: String,
	url: String
},
{
	timestamps: true
});



module.exports = mongoose.model('Company', companySchema);