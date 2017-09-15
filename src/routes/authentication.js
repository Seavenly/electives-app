const router = require('express').Router();

module.exports = function auth(passport) {
  router.route('/login')
    .post((req, res) => {
      passport.authenticate('local', (err, user, info) => {
        if (err) { return res.send(err); }
        if (!user) { return res.json(info); }
        return req.logIn(user, (err2) => {
          if (err2) { return res.send(err2); }
          return res.json(user);
        });
      })(req, res);
    });

  router.route('/logout')
    .post((req, res) => {
      req.logout();
      res.json({ message: 'Logged out successfully' });
    });

  router.route('/profile')
    .post((req, res) => {
      if (req.isAuthenticated()) {
        return res.json(req.user);
      }
      return res.json({ message: 'Not logged in' });
    });

  return router;
};
