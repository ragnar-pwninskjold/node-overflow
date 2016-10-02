//get necessary tools

var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var configDB = require('./config/database.js');

//configure to connect to db

mongoose.connect(configDB.url); //connect to the DB


require('./config/passport')(passport); // pass passport for configuration

app.use('/static', express.static(__dirname + '/public'));
app.use(morgan('dev')); //this will log all requests to console
app.use(cookieParser()); //reading cookies for authentication
app.use(bodyParser());

app.set('view engine', 'ejs');

app.use(session({secret: "idk"}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


//set up routes

require('./app/routes.js')(app, passport);

//launch the server

app.listen(port);
console.log("Babies being made on port: " + port);
