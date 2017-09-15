/* eslint no-underscore-dangle: ["error", { "allow": ["_id", "_group", "_user"] }] */

const _ = require('lodash');
const logger = require('../tools/logger');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const StudentSchema = new Schema({
  _user: { type: Schema.Types.ObjectId, ref: 'User' },
  authPassword: String,
  grade: Number,
  required: [{ type: Schema.Types.ObjectId, ref: 'Elective' }], // required electives taken
  submit: Date,
  list: {
    q1: [{ type: Schema.Types.ObjectId, ref: 'Elective' }],
    q2: [{ type: Schema.Types.ObjectId, ref: 'Elective' }],
    q3: [{ type: Schema.Types.ObjectId, ref: 'Elective' }],
    q4: [{ type: Schema.Types.ObjectId, ref: 'Elective' }],
  },
  electives: { type: [{ type: Schema.Types.ObjectId, ref: 'Elective' }], default: [null, null, null, null] }, // ids
});

StudentSchema.methods.fullName = function fullName() {
  if (typeof this._user !== 'string') {
    return `${this._user.name.first} ${this._user.name.last}`;
  }
  return null;
};

StudentSchema.methods.electiveCount = function electiveCount(doc) {
  const student = this.toObject();
  let semesterCheck = 0;

  if (doc.constructor.modelName === 'ElectiveGroup') {
    return _.filter(student.electives, (n) => {
      const elective = _.find(doc.electives, a => a.equals(n));
      if (n && elective) {
        if (elective.semester) { return (semesterCheck += 1) % 2 === 0; }
        return true;
      }
      return false;
    }).length;
  }
  return _.filter(student.electives, (n) => {
    if (n && n.equals(doc._id)) {
      if (doc.semester) { return (semesterCheck += 1) % 2 === 0; }
      return true;
    }
    return false;
  }).length;
};

/*
  Return array of quarters the student selected the passed in elective
  ordered by pref
*/
StudentSchema.methods.quartersForElective = function quartersForElectives(elective) {
  const student = this;
  const electiveId = elective.id;
  const electiveLocations = [];
  const listObj = student.list.toObject();

  Object.values(listObj).forEach((quarter) => {
    const stringIds = _.map(student.list[quarter], objectID => objectID.toString());
    const pref = _.indexOf(stringIds, electiveId) + 1;
    if (pref !== 0) {
      electiveLocations.push({
        pref,
        quarter: +quarter[1],
      });
    }
  });
  return _.pluck(_.sortBy(electiveLocations, 'pref'), 'quarter');
};

StudentSchema.methods.fillElectives = function fillElectives(electives) {
  const student = this;

  // cycle through each missing elective id
  electives.forEach((elective) => {
    const quarters = student.quartersForElective(elective);

    // cycle through student's quarter pref for each elective id
    let index;
    for (let j = 0; j < quarters.length; j += 1) {
      index = quarters[j] - 1;
      if (student.setElective(elective, index)) return;
    }
    // student's prefs not available, put student in elective for any open quarter
    const rest = _.difference(elective.available, quarters);
    for (let j = 0; j < rest.length; j += 1) {
      index = rest[j] - 1;
      if (student.setElective(elective, index)) { return; }
    }
    logger.error(`Unable to assign ${student.fullName()} to ${elective.name}`);
  });
};

/**
 * Checks for errors and sends them to the logger
 * @param {string} cycle Elective cycle
 * @param {Object} student Student object
 * @param {Object} elective Elective object
 * @param {number} index Current index
 * @returns {boolean} Error not found
 */
function checks(cycle, student, elective, index) {
  const messageFront = `(${student.grade}) ${student.fullName()} :: ${elective.name} (Quarter ${index + 1}) ::`;
  if (elective.grades.indexOf(student.grade) === -1) {
    logger.log('GRADE', `${messageFront} Incorrect correct grade`);
    return false;
  } else if (student.electives[index]) {
    logger.log('FILLED', `${messageFront} Already assigned for Quarter ${index + 1}`);
    return false;
  }
  if (elective.semester && student.electives[index + 1]) {
    logger.log('SEMI', `${messageFront} Already assigned for Quarter ${index + 2}`);
    return false;
  }
  if (elective.totalCurrent(index) >= elective.cap) {
    logger.log('FULL', `${messageFront} Elective is full (${elective.quartersdata[index].students.length} of ${elective.cap})`);
    return false;
  }

  if (cycle === 'TCC') {
    if (elective._group && elective._group.limit > 0
          && student.electiveCount(elective._group) >= elective._group.limit) {
      logger.log('LIMIT', `${messageFront} Initial limit for ${elective._group.name} (group) reached`);
      return false;
    } else if (elective.limit > 0 && student.electiveCount(elective) >= elective.limit) {
      logger.log('LIMIT', `${messageFront} Initial limit for ${elective.name} reached`);
      return false;
    }
    if (elective.quartersdata[index].current[student.grade - 6] + 1 >
          elective.cap / elective.grades.length) {
      logger.log('TCC-FULL', `${messageFront} Full to 1/${elective.grades.length} for ${student.grade}th graders`);
      return false;
    }
  }
  return true;
}
//  Set student elective data at index
StudentSchema.methods.setElective = function setElective(elective, index, cycle) {
  const student = this;
  if (checks(cycle, student, elective, index)) {
    student.electives.set(index, elective._id);
    if (elective.semester) { student.electives.set(index + 1, elective._id); }
    elective.quartersdata[index].current
      .set(student.grade - 6, elective.quartersdata[index].current[student.grade - 6] + 1);
    elective.quartersdata[index].students.push(student._id);
    elective.quartersdata[index].names.push(student.fullName());

    logger.log('SUCCESS', `(${student.grade}) ${student.fullName()} :: ${elective.name} (Quarter ${index + 1}) :: Elective assigned (${elective.quartersdata[index].students.length} of ${elective.cap})`);
    return true;
  }
  return false;
};

StudentSchema.methods.removeElective = function removeElective(index, electives) {
  const student = this;
  if (!student.electives[index]) {
    logger.error(`(${student.grade}) ${student.fullName()} has no elective for Quarter ${index + 1} to remove`);
    return false;
  }
  const elective = _.find(electives, elec => elec.id === student.electives[index].toString());
  student.electives.set(index, null);

  if (elective.semester) { student.electives.set(index + 1, null); }
  elective.quartersdata[index].current
    .set(student.grade - 6, elective.quartersdata[index].current[student.grade - 6] - 1);
  elective.quartersdata[index].students
    .splice(_.findIndex(elective.quartersdata[index].students,
      studentId => studentId.toString() === student.id), 1);

  logger.log('REMOVE', `(${student.grade}) ${student.fullName()} :: ${elective.name} (Quarter ${index + 1}) :: Elective removed`);
  return elective;
};

module.exports = mongoose.model('Student', StudentSchema);
