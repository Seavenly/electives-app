'use strict';

var Student           = require('../models/student');
var generatePassword  = require('password-generator');

var students = {

  createAll: function(req, res) {
    var arr = req.body.students;
    var header = arr.shift();
    var count = arr.length;

    arr.forEach(function(line) {
      var data = {
        name: {
          first: line[header.indexOf('First')],
          last: line[header.indexOf('Last')],
        },
        grade: line[header.indexOf('Grade')],
        spanish: false,
        pass: {
          student: generatePassword(),
          parent: generatePassword(3, false)
        }
      };

      var student = new Student(data);
      student.save(function(err) {
        if(err) { res.send(err); }
        count--;
        if(count === 0) {
          return res.json({ message: 'Students successfully added.' });
        }
      });
    });
  },

  createOne: function(req, res) {
    var student = new Student();

    student.username      = (req.body.firstName[0] + req.body.lastName).toLowerCase();
    Student.findOne({ username: student.username }, function(err, student) {
      if(err) { res.send(err); }
      if(student) { return res.json({ message: 'Student with username "' + student.username + '" already exists.' }); }
    });

    student.name.first    = req.body.firstName;
    student.name.last     = req.body.lastName;
    student.grade         = req.body.grade;
    student.spanish       = req.body.spanish;

    student.pass.student  = generatePassword();
    student.pass.parent   = generatePassword(3, false);

    student.save(function(err) {
      if(err) { res.send(err); }
      res.json({ message: 'Student created: ' + student.username });
    });
  },

  getAll: function(req, res) {
    Student.find(function(err, students) {
      if(err) { res.send(err); }
      res.json(students);
    });
  },

  getOne: function(req, res) {
    Student.findById(req.params.student_id, function(err, student) {
      if(err) { res.send(err); }
      res.json(student);
    });
  },

  update: function(req, res) {
    Student.findById(req.params.student_id, function(err, student) {
      if(err) { res.send(err); }
      student.name.first    = req.body.firstName;
      student.name.last     = req.body.lastName;
      student.username      = req.body.firstName[0] + req.body.lastName;
      student.grade         = req.body.grade;
      student.spanish       = req.body.spanish;

      student.save(function(err) {
        if(err) { res.send(err); }
        res.json({ message: 'Student updated' });
      });
    });
  },

  delete: function(req, res) {
    Student.remove({
      _id: req.params.student_id
    }, function(err) {
      if(err) { res.send(err); }
      res.json({ message: 'Successfully delete student'});
    });
  }
};

module.exports = students;
