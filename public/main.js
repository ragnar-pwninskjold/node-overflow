var company;
var name;
var price;
var ticker;
var ratios;

$(document).ready(function() {
//console.log(db);
	$('input').keypress(function(e) {

		if (e.which == 13) {
			e.preventDefault();
			var query = $('#searchBox').val();
			$.get('/api/'+query, function(data) {
				console.log(data);
				name = data.name;
				price = data.price;
				ticker = data.ticker;
				ratios = data.ratios;
				change = data.change;
				$("#companyName").text(name);
				$("#companyTicker").text(ticker);
				$("#currentPrice").text(price);
				if (change>=0) {
					$("#percentChange").text("(+"+change+"%)").css("color", "green");
				}
				else{
					$("#percentChange").text("(-"+change+"%)").css("color", "red");
				}
				$("#pe").text(ratios[0]);
				$("#de").text(ratios[1]);
				$("#roe").text(ratios[2]);
				$("#roa").text(ratios[3]);
				$("#currentratio").text(ratios[4]);
				$("#assetturnover").text(ratios[5]);
			});
		}
	});

	$("#buy-button").on("click", function() {
		var amount = prompt("How many shares?");
		console.log(amount);
		console.log(company);
		$.post('/positions', {company: company, amount: amount}, function(data, status) {
			console.log(data);
			console.log(status);
		});
	});





});




function makePriceGraph(chart, obj) {
	console.log(obj);
	lbl = [];
	pric = [];
	for (var i = 0; i < 5; i++) {
		lbl.push(obj.data[i].date);
		pric.push(obj.data[i].value);
		
	}
	lbl = lbl.reverse();
	console.log(lbl);
	console.log(pric);
	var graph = new Chart(chart, {
		type: 'line',
		data: {
			labels: lbl,
			datasets: [{
				label: 'Historical Stock Price',
				data: [{
					x: 1,
					y: pric[4] 
				}, {
					x: 2,
					y: pric[3]
				}, {
					x: 3,
					y: pric[2]
				}, {
					x: 4,
					y: pric[1] 
				}, {
					x: 5,
					y: pric[0]
				}]
			}]
		}
	});

 	//return graph;

}





