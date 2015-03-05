'use strict';

var _         = require('lodash');
var logger    = require('../tools/logger');
var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;

var StudentSchema = new Schema({
  _user: { type: Schema.Types.ObjectId, ref: 'User' },
  name: {
    first: String,
    last: String
  },
  authPassword: String,
  grade: Number,
  required: [{ type: Schema.Types.ObjectId, ref: 'Elective' }], //required electives taken
  submit: Date,
  list: {
    q1: [{ type: Schema.Types.ObjectId, ref: 'Elective' }],
    q2: [{ type: Schema.Types.ObjectId, ref: 'Elective' }],
    q3: [{ type: Schema.Types.ObjectId, ref: 'Elective' }],
    q4: [{ type: Schema.Types.ObjectId, ref: 'Elective' }],
  },
  electives: { type: [{ type: Schema.Types.ObjectId, ref: 'Elective' }], default: [null, null, null, null] } //ids
});

StudentSchema.methods.fullName = function() {
  return this.name.first+' '+this.name.last;
};
StudentSchema.methods.electiveCount = function(doc) {
  var student = this.toObject();
  if (doc.constructor.modelName === 'Elective') {
    return _.remove(student.electives, function(n) { return !!(n && n.equals(doc._id)); }).length;
  } else if (doc.constructor.modelName === 'ElectiveGroup') {
    return _.remove(student.electives, function(n) { return !!(n && _.find(doc.electives, function(a){ return a.equals(n); })); }).length;
  }
};

/*
  Return array of quarters the student selected the passed in elective
  ordered by pref
*/
StudentSchema.methods.quartersForElective = function(elective) {
  var student = this;
  var electiveId = elective.id;
  var electiveLocations = [];
  for (var quarter in student.list.toObject()) {
    var stringIds = _.map(student.list[quarter], function(objectID) { return objectID.toString(); });
    var pref = _.indexOf(stringIds, electiveId) + 1;
    if (pref !== 0) {
      electiveLocations.push({
        pref: pref,
        quarter: +quarter[1]
      });
    }
  }
  return _.pluck(_.sortBy(electiveLocations, 'pref'), 'quarter');
};

StudentSchema.methods.fillElectives = function(electives) {
    var student = this;
    //cycle through each missing elective id
    electives.forEach(function(elective) {
      var quarters = student.quartersForElective(elective);

      // cycle through student's quarter pref for each elective id
      var index;
      for (var j in quarters) {
        index = quarters[j] - 1;
        if (student.setElective(elective, index)) { return; }
      }
      // student's prefs not available, put student in elective for any open quarter
      for (j in elective.available) {
        index = elective.available[j] - 1;
        if (student.setElective(elective, index)) { return; }
      }
      logger.log('(ERROR) Unable to assign '+student.fullName()+' to '+elective.name);
    });
};

function checks(cycle, student, elective, index) {
  if (student.electives[index]) {
    logger.log('(FILLED) '+student.fullName()+' has an elective for Quarter '+(index+1)+' already');
    return false;
  }
  if (elective.totalCurrent(index) >= elective.cap) {
    logger.log('(FULL) Unable to assign '+student.fullName()+' to '+elective.name);
    return false;
  }
  if (elective._group && student.electiveCount(elective._group) >= elective._group.perYear) {
    logger.log('(LIMIT) '+student.fullName()+' reached yearly limit for '+elective._group.name+' (group)');
    return false;
  } else if (student.electiveCount(elective) >= elective.perYear) {
    logger.log('(LIMIT) '+student.fullName()+' reached yearly limit for '+elective.name);
    return false;
  }
  if (cycle === 'OC1') {
    if (elective.quartersdata[index].current[student.grade-6]+1 > elective.cap/3) {
      logger.log('(OC1-FULL) '+student.fullName()+' ('+elective.name+' full to 1/3)');
      return false;
    }
  }
  return true;
}
//  Set student elective data at index
StudentSchema.methods.setElective = function(elective, index, cycle) {
  var student = this;
  if(checks(cycle, student, elective, index)) {
    student.electives[index] = elective._id;
    elective.quartersdata[index].current[student.grade-6] += 1;
    elective.quartersdata[index].students.push(student._id);
    logger.log('(SUCCESS) '+student.fullName()+' assigned to '+elective.name+' (Quarter '+(index+1)+')');
    return true;
  }
  return false;
};

module.exports = mongoose.model('Student', StudentSchema);
