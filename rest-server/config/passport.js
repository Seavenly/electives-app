'use strict';

module.exports = function(passport, User, LocalStrategy){

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use('local', new LocalStrategy(
    function(username, password, done) {
      User.findOne({ username: username }, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.pass.student !== password) { return done(null, false, { message: 'Invalid password' }); }
        console.log('User ' + user.username + ' logged in');
        return done(null, user);
      });
    }
  ));
};
