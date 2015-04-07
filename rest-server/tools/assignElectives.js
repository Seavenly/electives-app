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
  var electives = Elective.find().populate('_group').exec().then(function(electives) {
    return new promise(function(resolve, reject) {
      // if (err) { reject(err); }
      var popElectives = [];
      electives.forEach(function(elective) {
        if (elective._group) {
          elective.populate({
            path: '_group.electives',
            select: 'semester'
          }, function(err, popelective) {
            if (err) { reject(err); }
            popElectives.push(popelective);
            if (popElectives.length >= electives.length) {
              resolve(popElectives);
            }
          });
        } else {
          popElectives.push(elective);
          if (popElectives.length >= electives.length) {
            resolve(popElectives);
          }
        }
      });
    });
  });
  var students = Student.find({ submit: { $ne: null }}).sort('-grade submit').exec();
  return promise.all([electives, students]).then(function(data) {
    data[0].forEach(function(elective) {
      elective.quartersdata = [{
        current: [0,0,0], students: []
      },{
        current: [0,0,0], students: []
      },{
        current: [0,0,0], students: []
      },{
        current: [0,0,0], students: []
      }];
    });
    data[1].forEach(function(student) {
      student.electives = [null, null, null, null];
    });
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
  console.log(electives);
  for (var i in students) {
    var student = students[i];
    /*jshint loopfunc: true */
    logger.log('INFO', student.fullName()+' wants: '+ _.values(_.mapValues(student.list.toObject(), function(list) {
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

function fixCycle(data) {
  logger.log('HEAD', 'FIX CYCLE');
  var electives = data[0];
  var students = data[1];
  students.forEach(function(student) {
    /*jshint loopfunc: true */
    student.electives.forEach(function(electiveId, index) {
      if (!electiveId && index%2 === 0 && student.electives[index+1]) {
        var removedElective = student.removeElective(index+1, electives);
        for(var j in student.list['q'+(index+1)].toObject()) {
          var elective = _.find(electives, function(elective) {
            return elective.id === student.list['q'+(index+1)][j].toString();
          });
          if (student.setElective(elective, index, 'FIX')) { break; }
        }
        student.setElective(removedElective, index+1, 'FIX');
      }
    });
  });
  return data;
}

function findErrors(data) {
  var students = data[1];
  var electives = data[0];
  students.forEach(function(student) {
    student.electives.forEach(function(elective, index) {
      if (!elective) {
        logger.error(student.fullName()+' is missing an elective for Quarter '+(index+1));
      }
    });
  });
  electives.forEach(function(elective) {
    elective.available.forEach(function(quarter) {
      if (elective.totalCurrent(+quarter-1) > elective.cap) {
        logger.error(elective.name+' has too many students for Quarter '+quarter+' ( '+elective.totalCurrent(+quarter-1)+' / '+elective.cap+' )');
      }
    });
  });
  return Student.find({ submit: null }).exec().then(function(students) {
    students.forEach(function(student) {
      logger.error(student.fullName()+' did not submit his or her electives');
    });
    return data;
  });
}

function logSummary(data) {
  var electives = data[0];
  var students = data[1];
  logger.log('HEAD', 'SUMMARY');
  students.forEach(function(student) {
    var electivesArr = _.map(student.electives, function(id) {
      if (!id) { return '(MISSING)'; }
      return _.find(electives, function(elective) {
        return elective.id === id.toString();
      }).name;
    });
    logger.log('INFO', student.fullName()+': '+electivesArr.join(', '));
  });
  return data;
}

function save(data) {
  return new promise(function(resolve, reject) {
    var electives = data[0];
    var students = data[1];
    var count = 0;
    var total = electives.length + students.length;
    students.forEach(function(student) {
      student.save(function(err) {
        if (err) { reject(err); }
        count++;
        if (count >= total) {
          resolve();
        }
      });
    });
    electives.forEach(function(elective) {
      elective.save(function(err) {
        if (err) { reject(err); }
        count++;
        if (count >= total) {
          resolve();
        }
      });
    });
  });
}

function assignElectives(req, res) {
    initialSetup()
    .then(requiredCycle)
    .then(otherCycleOne)
    .then(otherCycleTwo)
    .then(fixCycle)
    .then(findErrors)
    .then(logSummary)
    .then(save)
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
