var Company = require('./models/company.js');
var User = require('./models/user.js');
var Positions = require('./models/positions.js');
var History = require('./models/history.js');
var unirest = require('unirest');

module.exports = function(app, passport) {
	//make home page route

	app.get('/', function(req, res) {
		res.render('index.ejs');
	});

	//make login

	app.get('/login', function(req, res) {
		res.render('login.ejs', {message: req.flash('loginMessage')});
	});

	 app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

	//process login with passport

	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/builder',
		failureRedirect: '/signup',
		failureFlash: true
	}));

	app.get('/signup', function(req, res) {
		res.render('signup.ejs', {message: req.flash('signupMessage')});
	});

	//more passport things

	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user: req.user
		});
	});

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	app.get('/builder', isLoggedIn, function(req, res) {
		res.render('builder.ejs', {
			user: req.user
		});
	});

	app.get('/feed', isLoggedIn, function(req, res) {
		res.render('feed.ejs', {
			user: req.user
		});
	});

	app.get('/api/:query', isLoggedIn, function(req, res) {
		var ticker;
		var tickerArray;
		var result;

		getTicker(req.params.query, function(tickerArray) {
			company = tickerArray.name;
			ticker = tickerArray.ticker;
			tickerArray = tickerArray;
			var chartData;
			var runDbResult;
			runDb(tickerArray, function(err, dbResult) {
				getChartData(dbResult, function(err, chartResult) {
					dbResult.timeSeries = chartResult;
					console.log("logging dbResult after appending timeSeries");
					res.json(dbResult);
				});
			
			});
			
		});

		function runDb(tickArray, fn) {

			Company.findOne({ticker: tickArray[0].ticker}, function(err, data) {
				if (err){
					return fn(err, null);
				}
				if (data == null) {
					console.log('entry not found');
					getTickerPrice(tickArray, false, function(priceArray) {
						//then do res.json
						fn(null, priceArray);

					});
						
				}
				else {
					console.log('made it into the else');
					var currentTime = new Date();
					var mongoDate = data.updatedAt;
					diff = currentTime - mongoDate;
					if (diff > 1200000) { //if its been 20 minutes
						thisCompany = [];
						thisCompany[0] = {};
						thisCompany[0].name = tickArray[0].company; //this will be updated with name and ticker from above
						thisCompany[0].ticker = tickArray[0].ticker; //this will be updated with name and ticker from above

						getTickerPrice(tickArray, true, function(company){
							console.log("Updated this company");
							console.log(company);
							//do a res.json
							fn(null, company);

						}); 
					}
					else {
						console.log("This company gets sent back and not updated(less than 10 mins)");
						console.log(data);
						fn(null, data);

						//res.json to the client
					}
				}

			});
		}

	});

	app.post('/positions', isLoggedIn, function(req, res) {
		console.log(req.body);
		user = req.user;
		pos = req.body;
		//also need to add in price here
		addPosition(user, pos);
		res.json(req.body);
	});

	app.get('/history', isLoggedIn, function(req, res) {
		//this will fill in the profile.ejs 'latest transactions' table 
		//with ticker, volume, and buy/sell order
	});



	function isLoggedIn(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}

		res.redirect('/');
	}
}

function addPosition(user, position) {
	positions = [];
	positions[0] = {};
	positions[0].user = user;
	positions[0].volume = position.amount;
	positions[0].ticker = position.company;
	positions[0].entryPrice = 100; //this needs to be updated with actual price
	Positions.create(positions[0], function(err) {

		if (err) {
			return res.status(500).json({
				message: 'Error: ' + err
			});
		}

	});
	console.log(positions);
};

function getTicker(query, done) {

	var req = unirest("GET", "https://api.intrinio.com/companies");

	req.query({
	  "query": query
	});

	req.headers({
	  "postman-token": "77298af7-e61e-5477-badb-3d9cb54271a7",
	  "cache-control": "no-cache",
	  "authorization": "Basic Y2Q3MjVhZWZmMjc3NjRhODEzYTNiYmMwMTJhYzU0OTg6NTBmYjA2ZWI0NWMwNTBkZmNjZDM3N2Q2OGJmOWEwMzk="
	});

	req.end(function (res) {
	  	if (res.error) throw new Error(res.error);

	  	var thisCompany = [];
		thisCompany[0] = {};
		var company = res.body.data[0].name;
		var companyTicker = res.body.data[0].ticker;
		thisCompany[0].name = company;
		thisCompany[0].ticker = companyTicker;
		if(done!=undefined){
			done(thisCompany);
		}
	});
};

function getTickerPrice(tickerArray, update, done) {

	var req = unirest("GET", "https://api.intrinio.com/data_point");

	req.query({
	  "identifier": tickerArray[0].ticker,
	  "item": "ask_price,percent_change,pricetoearnings,debttoequity,roe,roa,currentratio,assetturnover"
	});

	req.headers({
	  "postman-token": "b4078fef-b930-0b54-f44c-93b4b9720635",
	  "cache-control": "no-cache",
	  "authorization": "Basic Y2Q3MjVhZWZmMjc3NjRhODEzYTNiYmMwMTJhYzU0OTg6NTBmYjA2ZWI0NWMwNTBkZmNjZDM3N2Q2OGJmOWEwMzk="
	});


	req.end(function (res) {
	  if (res.error) throw new Error(res.error);
		var price = res.body.data[0].value;
		var percentChange = parseFloat(Math.round(res.body.data[1].value * 10000) / 100).toFixed(2);
		var pe = res.body.data[2].value;
		var de = res.body.data[3].value;
		var roe = res.body.data[4].value;
		var roa = res.body.data[5].value;
		var currentratio = res.body.data[6].value;
		var assetturnover = res.body.data[7].value;
		tickerArray[0].price = price;
		tickerArray[0].ratios = [pe, de, roe, roa, currentratio, assetturnover];
		tickerArray[0].change = percentChange;
		//now add everything from last two requests to database
		if (update == false) {
			Company.create(tickerArray[0], function(err) {
				if (err) {
					return res.status(500).json({
						message: 'Error: ' + err
					});
				}
			});
		}
		else {
			Company.findOneAndUpdate({ticker: tickerArray[0].ticker}, {
				price: tickerArray[0].price,
				ratios: tickerArray[0].ratios,
				change: tickerArray[0].change

				}, function(err) {
					if (err) {
						return res.status(500).json({
							message: 'Error: ' + err
						});
					}
				});
					}

		done(tickerArray);
	});
	
};




function getNews(companyTicker) {

	$.ajax({
		url: "https://api.intrinio.com/news",
		data: "identifier="+companyTicker,
		type: "GET",
		beforeSend: function (xhr) {
    xhr.setRequestHeader ("Authorization", "Basic " + btoa('cd725aeff27764a813a3bbc012ac5498' + ":" + '50fb06eb45c050dfccd377d68bf9a039'));
},
	})
	.done(function(result) {
		//

		console.log(result.data);
		for (var i = 0; i < 10; i++) {
			console.log("here "+ i);
			var story = $(".templates .news-item").clone();
			var date = story.find(".date");
			date.text(result.data[i].publication_date);
			var title = story.find(".title");
			title.text(result.data[i].title);
			var summary = story.find(".summary");
			summary.text(result.data[i].summary);
			var url = story.find(".url");
			url.text(result.data[i].url);
			$(".news-items").append(story);
		}		

	});
};

function getChartData(dbResultObj, done) {

	var req = unirest("GET", "https://api.intrinio.com/historical_data");

req.query({
  "identifier": dbResultObj.ticker,
  "item": "close_price",
  "frequency": "yearly"
});

req.headers({
  "postman-token": "19332f0f-a6e3-79b9-420e-7d3c84947540",
  "cache-control": "no-cache",
  "authorization": "Basic Y2Q3MjVhZWZmMjc3NjRhODEzYTNiYmMwMTJhYzU0OTg6NTBmYjA2ZWI0NWMwNTBkZmNjZDM3N2Q2OGJmOWEwMzk="
});


req.end(function (res) {
  if (res.error) throw new Error(res.error);
  Company.findOneAndUpdate({ticker: dbResultObj.ticker}, {
					timeSeries: res.body.data

					}, function(err) {
						if (err) {
							return res.status(500).json({
								message: 'Error: ' + err
							});
						}
					});
  done(null, res.body.data);

});
};



