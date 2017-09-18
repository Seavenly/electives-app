const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');

const router = require('./routes/router');
const mongodbConfig = require('./config/mongodb');
const User = require('./models/user');

mongoose.connect(mongodbConfig.address);

// Config passport
require('./config/passport')(passport, User, LocalStrategy);
const authRouter = require('./routes/authentication')(passport);

const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'change this later' }));
app.use(passport.initialize());
app.use(passport.session());

app.all('/*', (req, res, next) => {
  const origin = req.headers.origin;
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

const port = process.env.PORT || 8080;

app.use('/api', router);
app.use('/auth', authRouter);

app.listen(port);
console.log(`Server running on port ${port}`);
