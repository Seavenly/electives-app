'use strict';

var User = require('../models/user');


var admins = {

  create: function(req, res) {
    var user = new User({
      name: {
        first:  req.body.name.first,
        last:   req.body.name.last
      },
      username: req.body.username,
      password: req.body.password,
      access:   'admin',
      data:     null
    });

    user.save(function(err) {
      if (err) { res.send(err); }
      res.json(user);
    });
  },

  getAll: function(req, res) {
    User.find({ access: 'admin' }, function(err, users) {
      if (err) {res.send(err); }
      res.json(users);
    });
  },

  update: function(req, res) {
    User.findById(req.params.user_id, function(err, user) {
      if (err) { res.send(err); }

      if (req.body.name && req.body.name.first) { user.name.first = req.body.name.first; }
      if (req.body.name && req.body.name.last)  { user.name.last = req.body.name.last; }
      if (req.body.username)                    { user.username = req.body.username; }
      if (req.body.password)                    { user.password = req.body.password; }

      user.save(function(err) {
        if (err) { res.send(err); }
        res.json(user);
      });

    });
  },

  delete: function(req, res) {
    User.remove({ _id: req.params.user_id }, function(err) {
      if (err) { res.send(err); }
      res.json({ message: 'User successfully removed.' });
    });
  }

};

module.exports = admins;
