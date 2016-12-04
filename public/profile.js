var posArray = [];
var sectors = [];
var companies = [];
var history = [];
var trueSectors = [];
var trueCompanies = [];
var changeArray = [];
var currentCompany = 0;

$(document).ready(function() {


$.get('/sectorvalue', function(data) {

	sectors = data;
});

$.get('/companies', function(data) {
	
	companies = data;
});


$.get('/positions', function(data) {
	var portfolioVal = 0;
	var nameArray = [];
	posArray = data;
	var localCount=0;
	$.each(posArray, function(index, value) {
		var sector = value.sector;
		localCount++;
		var presence = sectors.indexOf(sector);
		var presence2 = trueSectors.indexOf(sector);
		
			if (presence != -1 && presence2 == -1) {
			trueSectors.push(sector);
		}
	});

	$.each(posArray, function(index, value) {
		var presence = companies.indexOf(value.name);
		var presence2 = trueCompanies.indexOf(value.name);
		if (presence != -1 && presence2 == -1) {
			trueCompanies.push(value.name);
		}
	});
	
	var posAndSec = [];
	for (var i = 0; i < posArray.length; i++) {
		thisVal = ((posArray[i].entryPrice)*(posArray[i].volume));
		portfolioVal+=thisVal;
		makeTile(posArray[i]);
	}
	var totalsArray = [];
	$.each(trueSectors, function(index, value) {
		var total = 0;
		
		for (i=0; i<posArray.length;i++) {
			if (value == posArray[i].sector) {
				total+=(posArray[i].entryPrice)*(posArray[i].volume);
			}
			
		}
			
			totalsArray.push(total);
	});
	var companiesArray = [];
	$.each(trueCompanies, function(index, value) {
		var total = 0;
		
		for (i=0; i<posArray.length;i++) {
			if (value == posArray[i].name) {
				total+=(posArray[i].entryPrice)*(posArray[i].volume);
			}
			
		}
		
			companiesArray.push(total);
	});
	$.each(trueCompanies, function(index, value) {
		$.get('/api/'+value, function(data) {
			change = data.change;
			changeArray.push(change);
			barChart();
		});
	});	

	
	var sectorchart = $("#breakdown");
	makeSectorPie(trueSectors, totalsArray, sectorchart, "pie");
	var companieschart = $("#sectorperformance");
	makeSectorPie(trueCompanies, companiesArray, companieschart, "doughnut");

	var barChart = function () {
		currentCompany++;
		if (currentCompany == trueCompanies.length) {
			var performanceChart = $("#portfolioperformance");
			makeBar(trueCompanies, changeArray, performanceChart, "bar");
		}
	};

	
	portfolioVal = portfolioVal.toFixed(2);
	$(".pVal").text("$"+portfolioVal);
	$(".numpos").text(posArray.length);



});






$.get('/history', function(data) {
	
	history = data;
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
		//do nothing
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
		if (data == "negative-balance") {
			alert("Sorry, you don't have enough cash to make that purchase");
		}
	});
});



$.get('/cash', function(data) {
	userObj = data;
	cash = (userObj.cash).toFixed(2);
	$('.cVal').text("$"+cash);
});


});



function makeRow(data) {
		var mainObj = data;
		var newRow = $(".templates .table-data").clone();
		var currentPrice;
	

		$.get('/api/'+data.name, function(data) {

		currentPrice = data.price;
	

		var date = mainObj.createdAt;
		var price = mainObj.entryPrice.toFixed(2);
		var name = mainObj.name;

		var volume = mainObj.volume;
		var orderType = mainObj.orderType;
		var value = (price*volume).toFixed(2);
		var orderType = mainObj.orderType;
		var tId = mainObj.posId;
		var tIdRow = newRow.find(".tId");
		tIdRow.text(tId);
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
	var value = (pos.entryPrice*vol);
	val = value.toFixed(2);

	var nameTile = tile.find('.companyname');
	nameTile.text(name);

	var volTile = tile.find('.vol');
	volTile.text(vol);

	var valTile = tile.find('.posVal');
	valTile.text(val);

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

function makeBar(labels, totals, chart, type) {


// lbl = [];
totl = [];
colors = [];


	for (var i = 0; i < totals.length; i++) {
		var x = getRandomColor();
		colors.push(x);
		totl.push(totals[i]);
	}
	
	// lbl = lbl.reverse();
	
	var graph = new Chart(chart, {
		type: type,
		data: {
			labels: labels,
			datasets: [{
				label: "%Change in Stock Performance",
				data: totals,
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


