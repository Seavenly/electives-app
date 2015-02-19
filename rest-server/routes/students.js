'use strict';

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

      var username = (data.name.first[0] + data.name.last).toLowerCase();
      Student.findOne({ username: username }, function(err, student) {
        if(err) { res.send(err); }
        if(student) {
          username = data.name.first[0] + data.name.first[1] + data.name.last;
        }
        data.username = username;

        var newStudent = new Student(data);
        newStudent.save(function(err) {
          if(err) { res.send(err); }
          count--;
          students.push(newStudent);
          if(count === 0) {
            return res.json(students);
          }
        });

      });
    });
  },

  createOne: function(req, res) {
    var student = new Student();

    student.username      = (req.body.name.first[0] + req.body.name.last).toLowerCase();
    Student.findOne({ username: student.username }, function(err, student) {
      if(err) { res.send(err); }
      if(student) { return res.json({ message: 'Student with username "' + student.username + '" already exists.' }); }

      student.name.first    = req.body.name.first;
      student.name.last     = req.body.name.last;
      student.grade         = req.body.grade;
      student.spanish       = req.body.spanish;

      student.pass.student  = generatePassword();
      student.pass.parent   = generatePassword(3, false);

      student.save(function(err) {
        if(err) { res.send(err); }
        res.json({ message: 'Student created: ' + student.username });
      });

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
      if (err) { res.send(err); }
      if (req.body.name && req.body.name.first)   { student.name.first    = req.body.name.first; }
      if (req.body.name && req.body.name.last)    { student.name.last     = req.body.name.last; }
      if (req.body.username)                      { student.username      = req.body.username; }
      if (req.body.grade)                         { student.grade         = req.body.grade; }
      if (req.body.spanish)                       { student.spanish       = req.body.spanish; }
      if (req.body.pass && req.body.pass.student) { student.pass.student  = req.body.pass.student; }
      if (req.body.pass && req.body.pass.parent)  { student.pass.parent   = req.body.pass.parent; }
      if (req.body.electives)                     { student.electives     = req.body.electives; }

      if (req.body.list)                          { student.list          = req.body.list;
                                                    student.submit        = new Date(); }

      student.save(function(err) {
        if(err) { res.send(err); }
        if (req.isAuthenticated()) {
          var studentObj = student.toObject();
          delete studentObj.pass;
          console.log(studentObj);
          res.json(studentObj);
        } else {
          res.json(student);
        }
      });
    });
  },

  delete: function(req, res) {
    Student.remove({
      _id: req.params.student_id
    }, function(err, student) {
      if(err) { res.send(err); }
      res.json(student);
    });
  }
};

module.exports = students;
