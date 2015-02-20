'use strict';

var router    = require('express').Router();

module.exports = function(passport) {

  router.route('/login')
    .post(function(req, res) {
      passport.authenticate('local', function(err, user, info) {
        if (err) { return res.send(err); }
        if (!user) { return res.json(info); }
        req.logIn(user, function(err) {
          if (err) { return res.send(err); }
          return res.json(user);
        });
      })(req, res);
    });

  router.route('/logout')
    .post(function(req, res) {
      req.logout();
      res.json({ message: 'Logged out successfully' });
    });

  router.route('/profile')
    .post(function(req, res) {
      if (req.isAuthenticated()) {
        return res.json(req.user);
      } else {
        return res.json({ message: 'Not logged in' });
      }
    });

  return router;

};
