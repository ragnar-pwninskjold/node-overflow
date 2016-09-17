$(document).ready(function() {
	var query = $('search-term').val();
	companyCall(query);
});

function companyCall(query) {
	var params = {
		query: query
	};

	$.ajax({
		url: "https://api.intrinio.com/companies",
		data: params,
		type: "GET"

	});
	.done(function(result) {

		console.log(result);

	});
};