/* eslint no-underscore-dangle: ["error", { "allow": ["_id", "_group"] }] */

module.exports = function pass(passport, User, LocalStrategy) {
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      if (err) { done(err); }
      User.populate(user, { path: 'data', select: '-_user -name -authPassword' }, (err2, user2) => {
        if (err2) { done(err2); }

        const u = user2.toObject();
        delete u.password;
        return done(err, u);
      });
    });
  });

  passport.use('local', new LocalStrategy(
    (username, password, done) => {
      User.findOne({ username }, (err, user) => {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: `Unknown user ${username}` }); }
        if (user.password !== password) { return done(null, false, { message: 'Invalid password' }); }
        return User.populate(user, { path: 'data', select: '-_user -name -authPassword' }, (err2, user2) => {
          if (err2) { done(err2); }

          const u = user2.toObject();
          delete u.password;
          return done(null, u);
        });
      });
    },
  ));
};
