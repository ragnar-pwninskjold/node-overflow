//var Chart = require('chart.js');

$(document).ready(function() {

	$('input').keypress(function(e) {
		if (e.which == 13) {
			var query = $('#search-term').val();
			companyCall(query);
			console.log(query);
		}
	});

	var chart = document.getElementById("lineChart1");
	makePriceGraph(chart);
	//charts to make:
	//line graph
	//bar chart
	//PE ratio
	//ROE
	//
	


});



function companyCall(query) {
	var params = {
		query: query
	};

	$.ajax({
		url: "https://api.intrinio.com/companies",
		data: params,
		type: "GET",
		beforeSend: function (xhr) {
    xhr.setRequestHeader ("Authorization", "Basic " + btoa('cd725aeff27764a813a3bbc012ac5498' + ":" + '50fb06eb45c050dfccd377d68bf9a039'));
},

	})
	.done(function(result) {
		console.log(result);
	});
};

function makePriceGraph(chart) {
	var graph = new Chart(chart, {
		type: 'line',
		data: {
			datasets: [{
				label: 'Scatter Dataset',
				data: [{
					x: -10,
					y: 0 
				}, {
					x: 0,
					y: 10
				}, {
					x: 10,
					y: 5
				}]
			}]
		},
		options: {
			scales: {
				xAxes: [{
					type: 'linear',
					position: 'bottom'
				}]
			}
		}
	});

 	//return graph;

}





