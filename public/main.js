var company;
var name;
var price;
var ticker;
var ratios;
var news;

$(document).ready(function() {
//console.log(db);
$.get('/api/apple', function(data) {
				console.log(data);
				name = data.name;
				price = data.price;
				ticker = data.ticker;
				ratios = data.ratios;
				change = data.change;
				newsArray = data.news;
				$("#companyName").text(name);
				$("#companyTicker").text(ticker);
				$("#currentPrice").text("$"+price);
				if (change>=0) {
					$("#percentChange").text("(+"+change+"%)").css("color", "green");
				}
				else{
					$("#percentChange").text("("+change+"%)").css("color", "red");
				}
				$("#pe").text(ratios[0]);
				$("#de").text(ratios[1]);
				$("#roe").text(ratios[2]);
				$("#roa").text(ratios[3]);
				$("#currentratio").text(ratios[4]);
				$("#assetturnover").text(ratios[5]);
				graphData = data.timeSeries;
				var chart = $("#lineChart1");
				makePriceGraph(chart, graphData);
				$(".newsCompany").text(name);

			for (var i = 0; i < 10; i++) {
				var story = $(".templates .news-item").clone();
				var date = story.find(".date");
				date.text(newsArray[i].publication_date);
				var title = story.find(".title");
				title.text(newsArray[i].title).attr("href", newsArray[i].url);
				var summary = story.find(".summary");
				summary.text(newsArray[i].summary);
				var url = story.find(".url");
				url.text(newsArray[i].url);
				$(".news-items").append(story);
			}	
			});
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
				newsArray = data.news;
				$("#companyName").text(name);
				$("#companyTicker").text(ticker);
				$("#currentPrice").text("$"+price);
				if (change>=0) {
					$("#percentChange").text("(+"+change+"%)").css("color", "green");
				}
				else{
					$("#percentChange").text("("+change+"%)").css("color", "red");
				}
				$("#pe").text(ratios[0]);
				$("#de").text(ratios[1]);
				$("#roe").text(ratios[2]);
				$("#roa").text(ratios[3]);
				$("#currentratio").text(ratios[4]);
				$("#assetturnover").text(ratios[5]);
				graphData = data.timeSeries;
				var chart = $("#lineChart1");
				makePriceGraph(chart, graphData);
				$(".newsCompany").text(name);

			for (var i = 0; i < 10; i++) {
				var story = $(".templates .news-item").clone();
				var date = story.find(".date");
				date.text(newsArray[i].publication_date);
				var title = story.find(".title");
				title.text(newsArray[i].title).attr("href", newsArray[i].url);
				var summary = story.find(".summary");
				summary.text(newsArray[i].summary);
				var url = story.find(".url");
				url.text(newsArray[i].url);
				$(".news-items").append(story);
			}	
			});
		}
	});

	$("#buy-button").on("click", function() {
		var amount = prompt("How many shares?");
		console.log(amount);
		console.log(name);
		$.post('/positions/buy', {company: name, amount: amount}, function(data, status) {
			console.log(data);
			console.log(status);
		});
	});





});




function makePriceGraph(chart, obj) {
	lbl = [];
	pric = [];
	
	for (var i = 0; i < 5; i++) {
		lbl.push(obj[i].date);
		pric.push(obj[i].value);
		
	}
	lbl = lbl.reverse();
	
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

}





