'use strict';

var Student   = require('../models/student');
var Elective  = require('../models/elective');
var Promise   = require('promise');
var _         = require('lodash');


function assignRandomElectives(student, electivesByQuarter) {
  var list = student.list;
  for (var q in list.toObject()) {
    var index = +q[1]-1;
    /*jshint loopfunc: true */
    list[q] = _.map(_.take(_.shuffle(_.filter(electivesByQuarter[index], function(elective) {
      return elective.grades.indexOf(student.grade) !== -1;
    })), 3), function(n) {
      return n.id;
    });
  }
}

module.exports = function(req, res){
  Promise.all([Elective.find().exec(), Student.find().exec()]).then(function(data) {
    var students = data[1];
    var electives = data[0];
    var electivesByQuarter = [];
    [1,2,3,4].forEach(function(quarter) {
      electivesByQuarter.push(_.filter(electives, function(elective) {
        return elective.toObject().available.indexOf(quarter) !== -1;
      }));
    });
    var count = students.length;
    students = _.shuffle(students);
    students.forEach(function(student, index) {
      assignRandomElectives(student, electivesByQuarter);
      var fakeDate = new Date();
      fakeDate.setDate(fakeDate.getDate()-1);
      fakeDate.setMinutes(index);
      student.submit = fakeDate;
      student.save(function(err) {
        if (err) { res.send(err); }
        count--;
        if (count === 0) {
          res.json({ message: 'Student elective lists randomly generated' });
        }
      });
    });
  });
};
