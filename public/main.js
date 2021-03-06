var company;
var name;
var price;
var ticker;
var ratios;
var news;
if (window.location.pathname == "/builder") {

$(document).ready(function() {

$('[data-toggle="popover"]').popover(); 

$.get('/api/apple', function(data) {
				name = data.name;
				price = data.price;
				ticker = data.ticker;
				ratios = data.ratios;
				change = data.change;
				newsArray = data.news;
				exchange = data.exchange;
				address = data.address;
				ceo = data.ceo;
				desc = data.description;
				url = data.url;
				$("#companyName").text(name);
				$("#companyTicker").text(ticker);
				$("#currentPrice").text("$"+price);
				$("#ceo").text(ceo);
				$("#address").text(address);
				$("#url").text(url);
				$("#short").text(desc);
				$("#exchange").text(exchange);
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
				title.text(newsArray[i].title);
				url = newsArray[i].url;
				titleAnchor = story.find(".titleanchor");
				titleAnchor.attr("href", url);
				var summary = story.find(".summary");
				summary.text(newsArray[i].summary);
				$(".news-items").append(story);
			}	
			});
	$('input').keypress(function(e) {

		if (e.which == 13) {
			e.preventDefault();
			$(".news-items").empty();
			var query = $('#searchBox').val();
			$.get('/api/'+query, function(data) {
				if (data == "NF") {
					alert("Sorry, that couldn't be found. Try another search please");
					return;
				}
				name = data.name;
				price = data.price;
				ticker = data.ticker;
				ratios = data.ratios;
				change = data.change;
				newsArray = data.news;
				exchange = data.exchange;
				address = data.address;
				ceo = data.ceo;
				desc = data.description;
				url = data.url;
				$("#companyName").text(name);
				$("#companyTicker").text(ticker);
				$("#currentPrice").text("$"+price);
				$("#ceo").text(ceo);
				$("#address").text(address);
				$("#url").text(url);
				$("#short").text(desc);
				$("#exchange").text(exchange);
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
	
		if (amount != 0) {
			if (amount != null) {
				$.post('/positions/buy', {company: name, amount: amount}, function(data, status) {
					if (data == "negative-balance") {
						alert("Sorry, you don't have enough cash for that");
						return;
					}
				});
			}
		}
	});





});




function makePriceGraph(chart, obj) {
	lbl = [];
	pric = [];
	chartData=[];


	
	for (var i = 0; i < obj.length; i++) {
		if(i < 5){
			lbl.push(obj[i].date);
			chartData.push({x:(i+1),y:obj[i].value});
		}
	}
	chartData.reverse();
	lbl.reverse();
	
	var graph = new Chart(chart, {
		type: 'line',
		data: {
			labels: lbl,
			datasets: [{
				label: 'Historical Stock Price',
				data: chartData
			}]
		},
		options: {
        responsive: true,
        maintainAspectRatio: true
    }

	});

}


}


