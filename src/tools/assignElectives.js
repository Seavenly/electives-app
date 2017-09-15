/* eslint no-underscore-dangle: ["error", { "allow": ["_id", "_group"] }] */

const _ = require('lodash');
const Student = require('../models/student');
const Elective = require('../models/elective');
const logger = require('./logger');


/**
 * Priority: 8, 7, 6
 * Required electives first, then the others
 * Required Cycle 1: Fill with 8th graders who need required
 * Other Cycle 1: Fill upto each grade cap by submit date
 * Other Cycle 2: Fill remaining spots by submit date
 * @returns {Promise} Setup promise
 */
function initialSetup() {
  logger.clear();
  const electives = Elective.find().populate('_group').exec();
  const students = Student.find({ submit: { $ne: null } }).sort('-grade submit').populate('_user').exec();
  return Promise.all([electives, students]).then((data) => {
    const setupData = [[], []];
    data[0].forEach((elective) => {
      const elec = elective;
      elec.quartersdata = [{
        current: [0, 0, 0], students: [], names: [],
      }, {
        current: [0, 0, 0], students: [], names: [],
      }, {
        current: [0, 0, 0], students: [], names: [],
      }, {
        current: [0, 0, 0], students: [], names: [],
      }];
      setupData[0].push(elec);
    });
    data[1].forEach((student) => {
      const s = student;
      s.electives = [null, null, null, null];
      setupData[1].push(s);
    });
    return setupData;
  });
}

/**
 * Required Cycle
 * Force fills required electives for 8th graders
 * @param {object} data - Data passed in from promise chain
 * @returns {object} data modified through function
 */
function requiredCycle(data) {
  logger.log('HEAD', 'REQUIRED CYCLE');
  const reqElectives = _.filter(data[0], elective => elective.required);
  if (!reqElectives.length) logger.log('INFO', 'There are no required electives');
  const students = _.filter(data[1], student => student.grade === 8);
  Object.values(students).forEach((student) => {
    const missing = _.filter(reqElectives, elective => !(_.find(student.required,
      n => n.equals(elective._id))));
    student.fillElectives(missing);
  });
  return data;
}

/**
 * First Choice
 * Atempt to give each student his/her first choice by grade/submit date
 * @param {object} data - Data passed from promise chain
 * @returns {object} data modified through function
 */
function topChoiceCycle(data) {
  logger.log('HEAD', 'TOP CHOICE CYCLE');
  const electives = data[0];
  const students = data[1];
  Object.values(students).forEach((student) => {
    logger.log('INFO', `(${student.grade}) ${student.fullName()} wants: ${_.values(_.mapValues(student.list.toObject(), list => _.find(electives, elective => elective.id === list[0].toString()).name)).join(', ')}`);

    Object.keys(student.list.toObject()).sort(() => 0.5 - Math.random()).forEach((quarter) => {
      const elective = _.find(electives, elec => elec.id === student.list[quarter][0].toString());
      const index = +quarter[1] - 1;
      student.setElective(elective, index, 'TCC');
    });
  });

  return data;
}

/**
 * Fill Cycle
 * Fill remaining spots by grade/submit date
 * @param {object} data - Data passed from Promise chain
 * @returns {object} data modified through function
 */
function fillCycle(data) {
  logger.log('HEAD', 'FILL CYCLE');
  const electives = data[0];
  const students = data[1];
  Object.values(students).forEach((student) => {
    if (student.electives.includes(null)) logger.log('INFO', `(${student.grade}) ${student.fullName()}: Filling electives`);
    student.electives.forEach((electiveId, index) => {
      if (!electiveId) {
        Object.keys(student.list[`q${index + 1}`].toObject()).some((j) => {
          const elective = _.find(electives, elec => elec.id === student.list[`q${index + 1}`][j].toString());
          return student.setElective(elective, index, 'FC');
        });
      }
    });
  });

  return data;
}

/**
 * Fix Cycle
 * Attempt to fix potential errors
 * @param {object} data - Data passed from Promise chain
 * @returns {object} data modified through function
 */
function fixCycle(data) {
  logger.log('HEAD', 'FIX CYCLE');
  const electives = data[0];
  const students = data[1];
  students.forEach((student) => {
    student.electives.forEach((electiveId, index) => {
      // Attempt to fill an empty Quarter 1 or 3 slot with semester long elective
      if (!electiveId && index % 2 === 0 && student.electives[index + 1]) {
        const removedElective = student.removeElective(index + 1, electives);
        Object.keys(student.list[`q${index + 1}`].toObject()).some((j) => {
          const elective = _.find(electives, elec => elec.id === student.list[`q${index + 1}`][j].toString());
          return student.setElective(elective, index, 'FIX');
        });
        student.setElective(removedElective, index + 1, 'FIX');
      }
    });
  });

  return data;
}

/**
 * Find errors in assigned electives and report them
 * @param {object} data - Data passed from Promise chain
 * @returns {object} data modified through function
 */
function findErrors(data) {
  const students = data[1];
  const electives = data[0];
  students.forEach((student) => {
    student.electives.forEach((elective, index) => {
      if (!elective) logger.error(`(${student.grade}) ${student.fullName()} :: Missing elective for Quarter ${index + 1}`);
    });
  });
  electives.forEach((elective) => {
    elective.available.forEach((quarter) => {
      if (elective.totalCurrent(+quarter - 1) > elective.cap) {
        logger.error(`${elective.name} (Quarter ${quarter}) :: Elective over cap (${elective.totalCurrent(+quarter - 1)} / ${elective.cap})`);
      }
    });
  });
  return Student.find({ submit: null }).exec().then((stus) => {
    stus.forEach((student) => {
      logger.error(`(${student.grade}) ${student.fullName()} :: Electives have not been submitted`);
    });

    return data;
  });
}

/**
 * Log each students' assigned electives
 * @param {object} data - Data passed from Promise chain
 * @returns {object} data modified through function
 */
function logSummary(data) {
  const electives = data[0];
  const students = data[1];
  logger.log('HEAD', 'ELECTIVE SUMMARY');
  electives.forEach((elective) => {
    elective.available.forEach((avail) => {
      logger.log('INFO', `${elective.name} (Quarter ${avail}): ${elective.quartersdata[avail - 1].students.length} of ${elective.cap}`);
      logger.log('TEXT', `${elective.name} (Quarter ${avail}): ${elective.quartersdata[avail - 1].names.join(', ')}`);
    });
  });
  logger.log('HEAD', 'STUDENT SUMMARY');
  students.forEach((student) => {
    let missing = false;
    const electivesArr = _.map(student.electives, (id) => {
      if (!id) {
        missing = true;
        return '(MISSING)';
      }
      return _.find(electives, elective => elective.id === id.toString()).name;
    });
    let elecStr = '';
    electivesArr.forEach((elec, i) => {
      elecStr += `Q${i + 1}: ${elec}`;
      if (i < electivesArr.length - 1) elecStr += ', ';
    });
    if (missing) logger.error(`(${student.grade}) ${student.fullName()}: ${elecStr}`);
    else logger.log('INFO', `(${student.grade}) ${student.fullName()}: ${elecStr}`);
  });

  return data;
}

/**
 * Save all changes to students' electives
 * @param {object} data - Data passed from Promise chain
 * @returns {object} data modified through function
 */
function save(data) {
  return new Promise((resolve, reject) => {
    const electives = data[0];
    const students = data[1];
    const total = electives.length + students.length;
    let count = 0;

    students.forEach((student) => {
      student.save((err) => {
        if (err) { reject(err); }
        count += 1;
        if (count >= total) {
          resolve();
        }
      });
    });
    electives.forEach((elective) => {
      elective.save((err) => {
        if (err) { reject(err); }
        count += 1;
        if (count >= total) {
          resolve();
        }
      });
    });
  });
}

/**
 * Assign electives to students based on their desired choices
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @returns {undefined} nothing
 */
function assignElectives() {
  return initialSetup()
    .then(requiredCycle)
    .then(topChoiceCycle)
    .then(fillCycle)
    .then(fixCycle)
    .then(findErrors)
    .then(logSummary)
    .then(save)
    .then(() => {
      if (logger.getErrors().length) {
        logger.log('ERROR', 'Electives calculated WITH ERRORS');
      } else {
        logger.log('SUCCESS', 'Electives calculated successfully');
      }
      return { log: logger.getLog(), errors: logger.getErrors() };
    });
}

module.exports = assignElectives;
