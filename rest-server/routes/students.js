'use strict';

var User              = require('../models/user');
var Student           = require('../models/student');
var generatePassword  = require('password-generator');

var students = {

  createAll: function(req, res) {
    var arr = req.body.students;
    var header = arr.shift();
    var count = arr.length-1;
    var students = [];

    arr.forEach(function(line) {
      if(!line) { return; }

      var newUser = new User({
        name: {
          first: line[header.indexOf('First')],
          last: line[header.indexOf('Last')],
        },
        username: (line[header.indexOf('First')][0] + line[header.indexOf('Last')]).toLowerCase(),
        password: generatePassword(),
        access: 'student'
      });

      var newStudent = new Student({
        name: {
          first: line[header.indexOf('First')],
          last: line[header.indexOf('Last')],
        },
        grade: line[header.indexOf('Grade')],
        authPassword: generatePassword(3, false)
      });

      newUser.data = newStudent._id;
      newStudent._user = newUser._id;

      Student.findOne({ username: newUser.username }, function(err, student) {
        if(err) { res.send(err); }
        if(student) {
          newUser.username = (line[header.indexOf('First')].substr(0,2) + line[header.indexOf('Last')]).toLowerCase();
        }

        newUser.save(function(err) {
          if (err) { res.send(err); }
          newStudent.save(function(err) {
            if (err) { res.send(err); }
            newUser.populate('data', '-_user -name -submit',  function(err, popUser) {
              if (err) { res.send(err); }
              count--;
              students.push(popUser);
              if(count === 0) {
                return res.json(students);
              }
            });
          });
        });

      });
    });
  },

  create: function(req, res) {
    var newUser = new User({
      name: {
        first:    req.body.name.first,
        last:     req.body.name.last
      },
      username:   (req.body.name.first[0] + req.body.name.last).toLowerCase(),
      password:   generatePassword(),
      access:     'student'
    });

    var newStudent = new Student({
      name: {
        first: req.body.name.first,
        last:   req.body.name.last
      },
      grade: req.body.data.grade,
      authPassword: generatePassword(3, false)
    });

    newUser.data = newStudent._id;
    newStudent._user = newUser._id;

    User.findOne({ username: newUser.username }, function(err, user) {
      if(err) { return res.send(err); }
      if(!!user) { newUser.username = (req.body.name.first[0] + req.body.name.first[1] + req.body.name.last).toLowerCase(); }

      newUser.save(function(err) {
        if (err) { res.send(err); }
        newStudent.save(function(err) {
          if (err) { res.send(err); }
          newUser.populate('data', '-_user -name -submit',  function(err, popUser) {
            if (err) { res.send(err); }
            return res.json(popUser);
          });
        });
      });

    });
  },

  getAll: function(req, res) {
    User.find({ access: 'student' },function(err, students) {
      if(err) { res.send(err); }
      User.populate(students, { path:'data', select:'-_user -name -submit' }, function(err, popStudents) {
        if(err) { res.send(err); }
        res.json(popStudents);
      });
    });
  },

  getOne: function(req, res) {
    User.findById(req.params.student_id, function(err, user) {
      if(err) { res.send(err); }
      User.populate(user, { path:'data', select:'-_user -name -submit' }, function(err, user) {
        res.json(user);
      });
    });
  },

  update: function(req, res) {
    User.findById(req.params.student_id, function(err, user) {
      if (err) { return res.send(err); }
      Student.findById(user.data, function(err, student) {
        if (err) { return res.send(err); }

        console.log(req.body);

        if (req.body.name && req.body.name.first)   { user.name.first       = req.body.name.first; }
        if (req.body.name && req.body.name.last)    { user.name.last        = req.body.name.last; }
        if (req.body.username)                      { user.username         = req.body.username; }
        if (req.body.password)                      { user.password         = req.body.password; }

        if (req.body.data) {
          if (req.body.data.grade)                  { student.grade         = req.body.data.grade; }
          if (req.body.data.required)               { student.required      = req.body.data.required; }
          if (req.body.data.authPassword)           { student.authPassword  = req.body.data.authPassword; }
          if (req.body.data.electives)              { student.electives     = req.body.data.electives; }

          if (req.body.data.list)                   { student.list          = req.body.data.list; }
          if (req.body.data.submit)                 { student.submit        = new Date(); }
        }

        user.save(function(err) {
          if(err) { return res.send(err); }
          student.save(function(err) {
            if (err) { return res.send(err); }
            var select = '-_user -name -submit';
            if (req.isAuthenticated() && req.user.access === 'student') {
                select += ' -authPassword';
            }
            User.populate(user, {path:'data', select:select}, function(err, user) {
              res.json(user);
            });
          });
        });
      });
    });
  },

  delete: function(req, res) {
    User.findById(req.params.student_id, function(err, user) {
      if (err) { res.send(err); }
      Student.remove({ _id: user.data }, function(err) {
        if(err) { res.send(err); }
        User.remove({ _id: req.params.student_id }, function(err) {
          if (err) { res.send(err); }
          res.json({ message: 'User '+user.username+' successfully removed.' });
        });
      });
    });
  }
};

module.exports = students;
