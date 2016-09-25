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
		successRedirect: '/profile',
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

	function isLoggedIn(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}

		res.redirect('/');
	}
}