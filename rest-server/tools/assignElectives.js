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
  logger.clear();
  var electives = Elective.find().populate('_group').exec();
  var students = Student.find({ submit: { $ne: null }}).sort('-grade submit').exec();
  return promise.all([electives, students]).then(function(data) {
    return data;
  });
}

function requiredCycle(data) {
  logger.log('HEAD', 'REQUIRED CYCLE');
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
  logger.log('HEAD', 'OTHER CYCLE ONE');
  var electives = data[0];
  var students = data[1];
  for (var i in students) {
    var student = students[i];
    /*jshint loopfunc: true */
    logger.log('INFO', student.fullName()+' wants...');
    logger.log('INFO', _.values(_.mapValues(student.list.toObject(), function(list) {
      return _.find(electives, function(elective) {
        return elective.id === list[0].toString();
      }).name;
    })).join(', '));
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
  logger.log('HEAD', 'OTHER CYCLE TWO');
  var electives = data[0];
  var students = data[1];
  for (var i in students) {
    var student = students[i];
    /*jshint loopfunc: true */
    student.electives.forEach(function(electiveId, index) {
      if (!electiveId) {
        for(var j in student.list['q'+(index+1)].toObject()) {
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
  var students = data[1];
  students.forEach(function(student) {
    student.electives.forEach(function(elective, index) {
      if (!elective) {
        logger.error(student.fullName()+' is missing an elective for Quarter '+(index+1));
      }
    });
  });
  return data;
}

function logSummary(data) {
  var electives = data[0];
  var students = data[1];
  logger.log('HEAD', 'SUMMARY');
  students.forEach(function(student) {
    var electivesArr = _.map(student.electives, function(id) {
      if (id === '_semester' || !id) { return id; }
      return _.find(electives, function(elective) {
        return elective.id === id.toString();
      }).name;
    });
    logger.log('INFO', student.fullName()+': '+electivesArr.join(', '));
  });
}

function assignElectives(req, res) {
    initialSetup()
    .then(requiredCycle)
    .then(otherCycleOne)
    .then(otherCycleTwo)
    .then(findErrors)
    .then(logSummary)
    .then(function() {
      if (logger.hasErrors()) {
        logger.log('ERROR', 'Electives calculated WITH ERRORS');
      } else {
        logger.log('SUCCESS', 'Electives calculated successfully');
      }
      res.json({ message: logger.getLog(), errors: logger.hasErrors() });
    }, function(err) {
      res.send(err);
    });

}

module.exports = assignElectives;
