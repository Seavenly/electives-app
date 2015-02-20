'use strict';

var router    = require('express').Router();

module.exports = function(passport) {

  router.route('/login')
    .post(function(req, res) {
      passport.authenticate('local', function(err, user) {
        if (err) { return res.send(err); }
        if (!user) { return res.json({ message: 'Invalid user' }); }
        req.logIn(user, function(err) {
          if (err) { return res.send(err); }

          var userObj = user.toObject();
          delete userObj.pass;
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
        var userObj = req.user.toObject();
        delete userObj.pass;
        return res.json(userObj);
      } else {
        return res.json({ message: 'Not logged in' });
      }
    });

  return router;

};
