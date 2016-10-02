var Position = require('../app/models/positions');

var examplePosition = new Position({
	ticker: "AAPL",
	volume: 1000,
	entryPrice: 1
	//entryDate: 
});

examplePosition.save(function(err) {
	if (err) {
		console.log("there was an error saving");
	}

	else {
		console.log("Success!: ");
		console.log(mongoose);
	}
});

console.log(examplePosition);
