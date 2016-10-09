var posArray = [];
var sectors = [];
var companies = [];
$(document).ready(function() {

$.get('/sectorvalue', function(data) {
	console.log("logging data from sector value");
	console.log(data);
	sectors = data;
});

$.get('/companies', function(data) {
	console.log("logging the unique companies from db");
	console.log(data);
	companies = data;
})

$.get('/positions', function(data) {
	var portfolioVal = 0;
	var nameArray = [];
	posArray = data;
	var posAndSec = [];
	for (var i = 0; i < posArray.length; i++) {
		thisVal = ((posArray[i].entryPrice)*(posArray[i].volume));
		portfolioVal+=thisVal;
		makeTile(posArray[i]);
	}
	var totalsArray = [];
	$.each(sectors, function(index, value) {
		var total = 0;
		
		for (i=0; i<posArray.length;i++) {
			if (value == posArray[i].sector) {
				total+=(posArray[i].entryPrice)*(posArray[i].volume);
			}
			
		}
			console.log("total for loop: " + index + "("+value+")");
			console.log(total);
			totalsArray.push(total);
	});
	var companiesArray = [];
	$.each(companies, function(index, value) {
		var total = 0;
		
		for (i=0; i<posArray.length;i++) {
			if (value == posArray[i].name) {
				total+=(posArray[i].entryPrice)*(posArray[i].volume);
			}
			
		}
			console.log("total for loop: " + index + "("+value+")");
			console.log(total);
			companiesArray.push(total);
	});

	// console.log(companiesArray);
	var sectorchart = $("#breakdown");
	makeSectorPie(sectors, totalsArray, sectorchart, "pie");
	var companieschart = $("#sectorperformance");
	makeSectorPie(companies, companiesArray, companieschart, "doughnut");

	// for (var i = 0; i < posArray.length; i++) {
	// 	if (posArray[i].sector == sectors[i]) {
	// 		var obj = {};
	// 		var value = posArray[i].entryPrice*posArray[i].volume;
	// 		var sector = sectors[i];
	// 		obj.value = value;
	// 		obj.sector = sector;
	// 		posAndSec.push(obj);
	// 	}
	// }

	// for (var i = 0; i < posAndSec.length; i++) {
	// 	posAndSec[i]
	// }
     console.log("positions: ");
	 console.log(data);
	// console.log("sectors: ");
	// console.log(sectors);
	// console.log(posAndSec);

	$(".pVal").text("$"+portfolioVal);
	$(".numpos").text(posArray.length);



});



$.get('/history', function(data) {
	console.log("history: ");
	console.log(data);
	for (var i = 0; i < data.length; i++) {
		makeRow(data[i]);
	}
});


$(document).on("click", "#sell", function(event) {
	dataRow = $(event.target).closest("tr");
	var company = dataRow.find(".tableCompanyName").text();
	var volume = dataRow.find(".bs-select").val();
	var origVolume = dataRow.find(".entryVol").val();
	var origPrice = dataRow.find(".entryPrice").val();
	var tId = dataRow.find(".tId").text();
	
	$.post('/positions/sell', {_id: tId, amount: volume}, function(data, status) {
		console.log("logging data from within the click of sell");
		console.log(data);
	});
	
});

$(document).on("click", "#buy", function(event) {
	var transactionArray = [];
	dataRow = $(event.target).closest("tr");
	var company = dataRow.find(".tableCompanyName").text();
	var volume = dataRow.find(".bs-select").val();
	transactionArray.push(company);
	transactionArray.push(volume);
	$.post('/positions/buy', {company: company, amount: volume}, function(data, status) {
		console.log("logging data from within the click of buy");
		console.log(data);
	});
});

// $.post('/positions', {name: 'Apple Inc', volume: 10, type: "sell"}, function(data, status) {
// 	console.log(data);
// });



});

function makeRow(data) {
		var mainObj = data;
		var newRow = $(".templates .table-data").clone();
		var currentPrice;
	

		$.get('/api/'+data.name, function(data) {

		currentPrice = data.price;
	

		var date = mainObj.createdAt;
		var price = mainObj.entryPrice;
		var name = mainObj.name;

		var volume = mainObj.volume;
		var orderType = mainObj.orderType;
		var value = price*volume;
		var orderType = mainObj.orderType;
		var tId = mainObj.posId;
	    var currentPriceRow = newRow.find('.currentPrice');
		currentPriceRow.text("$"+currentPrice);	
		var cPriceAtRow = newRow.find('.cPriceAt');
		cPriceAtRow.text(price);	

		var dateRow = newRow.find('.date');
		dateRow.text(date);

		var priceRow = newRow.find('.entryPrice');
		priceRow.text("$ "+price);

		var nameRow = newRow.find('.tableCompanyName');
		nameRow.text(name);

		var valRow = newRow.find('.entryVol');
		valRow.text(volume);

		var orderTypeRow = newRow.find('.buyorsell');
		orderTypeRow.text(orderType);

		var entryBox = newRow.find('.bs-select');

		var totalValue = newRow.find('.value');
		totalValue.text(value);

		if (orderType == "sell") {
			entryBox.hide();
		}

		$(".results-table").append(newRow);


		});

		

}

function makeTile(pos) {
	var tile = $(".templates .tile-li").clone();

	var name = pos.name;
	var vol = pos.volume;
	var value = pos.entryPrice*vol;
	console.log(value);

	var nameTile = tile.find('.companyname');
	nameTile.text(name);

	var volTile = tile.find('.vol');
	volTile.text(vol);

	var valTile = tile.find('.posVal');
	valTile.text(value);

	$(".positionsUl").append(tile);
}

function makeSectorPie(labels, totals, chart, type) {

lbl = [];
totl = [];
colors = [];
	
	for (var i = 0; i < totals.length; i++) {
		lbl.push(labels[i]);
		totl.push(totals[i]);
		var x = getRandomColor();
		colors.push(x);
	}


	// lbl = lbl.reverse();
	
	var graph = new Chart(chart, {
		type: type,
		data: {
			labels: lbl,
			datasets: [{
				data: totl,
				backgroundColor: colors

			}]
		}
	});
	
	

}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


