'use strict';

var promise   = require('promise');
var _         = require('lodash');
var Student   = require('../models/student');
var Elective  = require('../models/elective');

var logger    = require('./logger');


/*
  Priority: 8, 7, 6
  Required electives first, then the others

  Required Cycle 1: Fill with 8th graders who need required

  Other Cycle 1: Fill upto each grade cap by submit date
  Other Cycle 2: Fill remaining spots by submit date
*/

function initialSetup() {
  var electives = Elective.find().populate('_group').exec();
  var students = Student.find({ submit: { $ne: null }}).sort('grade submit').exec();
  return promise.all([electives, students]).then(function(data) {
    return data;
  });
}

function requiredCycle(data) {
  logger.log('--- REQUIRED CYCLE ---');
  var reqElectives = _.filter(data[0], function(elective) { return elective.required; });
  var students = _.filter(data[1], function(student){ return student.grade === 8; });
  for (var i in students) {
    var student = students[i];
    /*jshint loopfunc: true */
    var missing = _.filter(reqElectives, function(elective) {
      return !(_.find(student.required, function(n) { return n.equals(elective._id); }));
    });
    student.fillElectives(missing);
  }
  return data;
}

function otherCycleOne(data) {
  logger.log('--- OTHER CYCLE ONE ---');
  var electives = data[0];
  var students = data[1];
  for (var i in students) {
    var student = students[i];
    /*jshint loopfunc: true */
    logger.log(student.fullName()+' wants...');
    logger.log(_.mapValues(student.list.toObject(), function(list) {
      return _.find(electives, function(elective) {
        return elective.id === list[0].toString();
      }).name;
    }));
    for (var quarter in student.list.toObject()) {
      var elective = _.find(electives, function(elective) {
        return elective.id === student.list[quarter][0].toString();
      });
      var index = +quarter[1] - 1;
      student.setElective(elective, index, 'OC1');
    }
  }
  return data;
}

function otherCycleTwo(data) {
  logger.log('--- OTHER CYCLE TWO ---');
  var electives = data[0];
  var students = data[1];
  for (var i in students) {
    var student = students[i];
    /*jshint loopfunc: true */
    student.electives.forEach(function(electiveId, index) {
      if (!electiveId) {
        for(var j in student.list['q'+(index+1)]) {
          var elective = _.find(electives, function(elective) {
            return elective.id === student.list['q'+(index+1)][j].toString();
          });
          if (student.setElective(elective, index, 'OC2')) { return; }
        }
      }
    });
  }
  return data;
}

function findErrors(data) {

}

function assignElectives(req, res) {
    initialSetup()
    .then(requiredCycle)
    .then(otherCycleOne)
    .then(otherCycleTwo)
    .then(findErrors)
    .then(function() {
      logger.log('Electives calculated successfully');
      res.json({ message: logger.getLog() });
    }, function(err) {
      res.send(err);
    });

}

module.exports = assignElectives;
