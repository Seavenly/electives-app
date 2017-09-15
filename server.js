const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const router = require('./src/routes/router');
require('./src/config/mongoose');

const User = require('./src/models/user');

// Config passport
require('./src/config/passport')(passport, User, LocalStrategy);
const authRouter = require('./src/routes/authentication')(passport);

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
