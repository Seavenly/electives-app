'use strict';

module.exports = function(passport, User, LocalStrategy){

  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      if (err) { done(err); }
      User.populate(user, { path:'data', select:'-_user -name -authPassword' }, function(err, user) {
        if (err) { done(err); }

        user = user.toObject();
        delete user.password;
        return done(err, user);
      });
    });
  });

  passport.use('local', new LocalStrategy(
    function(username, password, done) {
      User.findOne({ username: username }, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password !== password) { return done(null, false, { message: 'Invalid password' }); }
        User.populate(user, { path:'data', select:'-_user -name -authPassword' }, function(err, user) {
          if (err) { done(err); }

          user = user.toObject();
          delete user.password;
          return done(null, user);
        });
      });
    }
  ));
};
