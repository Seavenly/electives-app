const User = require('../models/user');

const admins = {

  create: (req, res) => {
    const user = new User({
      name: {
        first: req.body.name.first,
        last: req.body.name.last,
      },
      username: req.body.username,
      password: req.body.password,
      access: 'admin',
      data: null,
    });

    user.save((err) => {
      if (err) { res.send(err); }
      res.json(user);
    });
  },

  getAll: (req, res) => {
    User.find({ access: 'admin' }, (err, users) => {
      if (err) { res.send(err); }
      res.json(users);
    });
  },

  update: (req, res) => {
    User.findById(req.params.user_id, (err, user) => {
      if (err) { res.send(err); }

      const u = user;
      if (req.body.name && req.body.name.first) u.name.first = req.body.name.first;
      if (req.body.name && req.body.name.last) u.name.last = req.body.name.last;
      if (req.body.username) u.username = req.body.username;
      if (req.body.password) u.password = req.body.password;

      user.save((err2) => {
        if (err2) { res.send(err2); }
        res.json(u);
      });
    });
  },

  delete: (req, res) => {
    User.remove({ _id: req.params.user_id }, (err) => {
      if (err) { res.send(err); }
      res.json({ message: 'User successfully removed.' });
    });
  },
};

module.exports = admins;
