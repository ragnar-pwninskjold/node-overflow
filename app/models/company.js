var mongoose = require('mongoose');

var companySchema = mongoose.Schema({
	ticker: String,
	name: String,
	price: Number,
	priceTime: Date,
	timeSeries:[{}],
	ratios:[Number],
	change: Number
},
{
	timestamps: true
});



module.exports = mongoose.model('Company', companySchema);