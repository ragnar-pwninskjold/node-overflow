var Company = require('./models/company.js');
var User = require('./models/user.js');
var Positions = require('./models/positions.js');
var History = require('./models/history.js');
var unirest = require('unirest');
var cron = require('node-cron');

//check out quandl api


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

	// app.get('/feed', isLoggedIn, function(req, res) {
	// 	res.render('feed.ejs', {
	// 		user: req.user
	// 	});
	// });

	app.get('/api/:query', isLoggedIn, function(req, res) {
		var ticker;
		var tickerArray;
		var result;

		getTicker(req.params.query, function(tickerArray) {
			company = tickerArray.name;
			ticker = tickerArray.ticker;
			tickerArray = tickerArray;
			console.log("now logging tickerArray after it was returned from the done");
			console.log(tickerArray);
			var chartData;
			var runDbResult;
			runDb(tickerArray, function(err, dbResult) {
					console.log("logging tickerArray inside of runDb");
					console.log(tickerArray);
					getChartData(dbResult, function(err, chartResult) {
						dbResult.timeSeries = chartResult;
						//dbResult.intro = tickerArray[0];
						getNews(tickerArray[0].ticker, function(newsArray) {
							dbResult.news = newsArray;

							res.json(dbResult);
						});
						
					});	
			
			});
			
		});

		function runDb(tickArray, fn) {

			Company.findOne({ticker: tickArray[0].ticker}, function(err, data) {
				if (err){
					return fn(err, null);
				}
				if (data == null) {
					console.log('entry not found, creating a new one');
					getTickerPrice(tickArray, false, function(priceArray) {
						//then do res.json
						fn(null, priceArray[0]);
					});
						
				}
				else {
					console.log('made it into the else');
					var currentTime = new Date();
					var mongoDate = data.updatedAt;
					diff = currentTime - mongoDate;

					if (diff > 2400000) { //if its been 40 minutes
						thisCompany = [];
						thisCompany[0] = {};
						thisCompany[0].name = tickArray[0].company; //this will be updated with name and ticker from above
						thisCompany[0].ticker = tickArray[0].ticker; //this will be updated with name and ticker from above

						getTickerPrice(tickArray, true, function(company){
							console.log("Updated this company since its been more than 10 minutes");
							//console.log(company);
							//do a res.json
						
							fn(null, company[0]);

						}); 
					}
					else {
						console.log("This company gets sent back and not updated(less than 10 mins)");
						//console.log(data);
					
						fn(null, data);

						//res.json to the client
					}
				}

			});
		}

	});

	app.post('/positions/:type', isLoggedIn, function(req, res) {
		var testcount = 0;
		user = req.user;
		uId = user._id;
		pos = req.body;
		//also need to add in price here
		
		if (req.params.type == "buy") {
			addPosition(user, pos, function(err, userId) {
				testcount++;
			
				if (err == "negative-balance") {
					res.json(err);
				}
				else {
					Positions.find({user: userId}, function(err, data) {
						res.json(data);
					});
				}
			});
		}
		
		if (req.params.type == "sell") {
			var posObj;
			var sellVol;
			Positions.find({_id: req.body._id}, function(err, data) {
				posObj = data[0];
			
				sellVol = req.body.amount;
				newVol = data[0].volume - req.body.amount;
				Positions.findOneAndUpdate({_id: req.body._id}, {volume: newVol}, function(err, data) {
					console.log(data);
					History.create({
						user: user._id,
						volume: req.body.amount,
						name: data.name,
						orderType: "sell",
						posId: data._id, 
						entryPrice: data.entryPrice
					}, function(err, data) {
						//do nothing
					});

					User.findOne({_id: req.user._id}, function(err, data) {
						currentCash = data.cash;
						sellAmount = posObj.entryPrice*sellVol;
						
						newAmount = currentCash+sellAmount;
						
						User.findOneAndUpdate({_id: req.user._id}, {cash: newAmount}, function(err, data) {
							//do nothing
						});
					});
				});
			});


		}
		
	});

	app.get('/positions', isLoggedIn, function(req, res) {
		user = req.user;
		uId = user._id;
		Positions.find({user: uId}, function(err, data) {
			res.json(data);
		});
	});

	app.get('/history', isLoggedIn, function(req, res) {

		History.find({user: req.user._id}, function(err, data) {
			res.json(data);
		});

	});

	app.get('/sectorvalue', isLoggedIn, function(req, res) {
		
		Positions.find().distinct('sector', function(err, ids) {
			res.json(ids);
		});
	});

	app.get('/companies', isLoggedIn, function(req, res) {
		Positions.find().distinct('name', function(err, ids) {
			res.json(ids);
		});
	});

	app.get('/userlist', isLoggedIn, function(req, res) {
		User.find({}, function(err, data) {
			res.json(data);
		});
	});

	app.get('/cash', isLoggedIn, function(req, res) {
		User.findOne({_id: req.user._id}, function(err, data) {
			res.json(data);
		});
	});



	// var task = cron.schedule('42 18 * * 7', function(){
	// 	console.log('cron job starting');

	// 	Positions.find().distinct('user', function(err, ids) {

	// 		//want to take value of each persons current volume * current market price, and save it

	// 		for (var i = 0; i < ids.length; i++) {
	// 			var portfolioValue = 0;
	// 			Positions.find({user: ids[i]}, function(err, data) {
	// 				console.log(data);
	// 				for (var i = 0; i < data.length; i++) {
	// 					portfolioValue+=(data[i].entryPrice*data[i].volume);
	// 				}
	// 				var date = new Date();
	// 				console.log("logging ids[i]");
	// 				console.log(ids[i]);
	// 				User.find({_id: ids[i]}, function(err, data) {
	// 					console.log(data);
	// 				});
	// 			});
	// 		}
	// 	});


	// }, false);

	// task.start();

	function isLoggedIn(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}

		res.redirect('/');
	}
}

function addPosition(user, position, done) {
	var price;
	positions = [];
	positions[0] = {};
	positions[0].user = user._id;
	positions[0].volume = position.amount;
	positions[0].name = position.company;

	Company.findOne({name: positions[0].name}, function(err, data) {
	
		if (err) {
			return res.status(500).json({
				message: 'Error: '+ err
			});
		}
		positions[0].sector = data.sector;
		positions[0].entryPrice = data.price;

		newCashTransaction = (data.price)*(position.amount);
		//find user and update his cash holdings
		User.findOne({_id: user._id}, function(err, data) {
			oldCash = data.cash;
			
			newAmount = oldCash - newCashTransaction;
			//why is this chunk of code returning "negative-balance"
			if (newAmount > 0) {
				console.log("inside of the if for negative balance");
				User.findOneAndUpdate({_id: user._id}, {cash: newAmount}, function(err, data) {
				});
				Positions.create(positions[0], function(err, data) {

					if (err) {
						return res.status(500).json({
							message: 'Error: ' + err
						});
					}
					positions[0].posId = data._id;

					positions[0].orderType = "buy";

					History.create(positions[0], function(err, data) {
						if (err) {
							return res.status(500).json({
								message: 'Error: ' + err
							});
						}
					});
				console.log("right before the done which should've been returned out of already");
				done(null, user._id);
				});
			}
			else {
				console.log("inside of the else for negative balance");
				return done("negative-balance", user._id);
			}
			//why is this chunk of code returning "negative-balance"
		});



	});
};



function getTicker(query, done) {

	var req = unirest("GET", "https://api.intrinio.com/companies");

	req.query({
	  "query": query
	});

	req.auth({
			user: ENV[uName],
			pass: ENV[pWord]
	});

	

	req.end(function (res) {
	  	if (res.error) throw new Error(res.error);
	  	var sector;
	  	var thisCompany = [];
		thisCompany[0] = {};
		var company = res.body.data[0].name;
		var companyTicker = res.body.data[0].ticker;
		thisCompany[0].name = company;
		thisCompany[0].ticker = companyTicker;
		getSector(companyTicker, function(compObj) {
			sector = compObj.sector;
			desc = compObj.short_description;
			ceo = compObj.ceo;
			exchange = compObj.stock_exchange;
			url = compObj.company_url;
			address = compObj.business_address;
		
			thisCompany[0].sector = sector;
			thisCompany[0].description = desc;
			thisCompany[0].ceo = ceo;
			thisCompany[0].exchange = exchange;
			thisCompany[0].url = url;
			thisCompany[0].address = address;
			
			if(done!=undefined){
				done(thisCompany);
			}
		});

		
	});
};

function getSector(ticker, done) {

	var req = unirest("GET", "https://api.intrinio.com/companies");

	req.query({
	  "ticker": ticker
	});

	req.auth({
			user: ENV[uName],
			pass: ENV[pWord]
	});

	req.end(function (res) {
	  	if (res.error) throw new Error(res.error);

		if(done!=undefined){
			done(res.body);
		}
	});
};

function getTickerPrice(tickerArray, update, done) {

	var req = unirest("GET", "https://api.intrinio.com/data_point");


	req.query({
	  "identifier": tickerArray[0].ticker,
	  "item": "ask_price,percent_change,pricetoearnings,debttoequity,roe,roa,currentratio,assetturnover"
	});

	req.auth({
			user: ENV[uName],
			pass: ENV[pWord]
	});


	req.end(function (res) {
	  console.log("inside of tickerprice");
	  console.log(res.body);
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




function getNews(companyTicker, done) {

	var req = unirest("GET", "https://api.intrinio.com/news");

	req.query({
	  "identifier": companyTicker
	});

	req.auth({
		user: ENV[uName],
		pass: ENV[pWord]
	});


	req.end(function (res) {
	  if (res.error) throw new Error(res.error);
	  Company.findOneAndUpdate({ticker: companyTicker}, {
				news: res.body.data

				}, function(err) {
					if (err) {
						return res.status(500).json({
							message: 'Error: ' + err
						});
					}
				});
		done(res.body.data);
});
	/*.done(function(result) {
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

	});*/
};

function getChartData(dbResultObj, done) {

	var req = unirest("GET", "https://api.intrinio.com/historical_data");

req.query({
  "identifier": dbResultObj.ticker,
  "item": "close_price",
  "frequency": "yearly"
});

req.auth({
		user: ENV[uName],
		pass: ENV[pWord]
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



