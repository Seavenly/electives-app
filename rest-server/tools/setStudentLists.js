'use strict';

var Student   = require('../models/student');

module.exports = function(req, res) {
  Student.find({ name: { last: req.params.param }}).exec().then(function(student) {
    var list = student.list;
    Student.find().exec().then(function(students) {
      var count = students.length;
      students.forEach(function(student) {
        student.list = list;
        student.submit = new Date();
        student.save(function(err) {
          if (err) { res.send(err); }
          count--;
          if(count === 0) {
            res.json({ message: 'Copied '+req.params.param+'\'s list to every student' });
          }
        });
      });
    });
  });
};
