'use strict';

var express       = require('express');
var session       = require('express-session');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var passport      = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose      = require('mongoose');
var router        = require('./rest-server/routes/router');

mongoose.connect('mongodb://dbadmin:zxcvbn@ds041167.mongolab.com:41167/electives-app');
var User          = require('./rest-server/models/user');
//Config passport
require('./rest-server/config/passport')(passport, User, LocalStrategy);
var authRouter    = require('./rest-server/routes/authentication')(passport);

var app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'change this later' }));
app.use(passport.initialize());
app.use(passport.session());

app.all('/*', function(req, res, next) {
  var origin = req.headers.origin;
  // CORS headers
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
  res.header('Access-Control-Allow-Credentials', true);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});

var port = process.env.PORT || 8080;

app.use('/api', router);
app.use('/auth', authRouter);

app.listen(port);
console.log('Server running on port ' + port);
