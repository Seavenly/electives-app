/* eslint no-underscore-dangle: ["error", { "allow": ["_id", "_group"] }] */

import * as _ from 'lodash';
import mongoose from 'mongoose';
import Student, { IStudent, IList } from '../models/Student';
import Elective, { IElective } from '../models/Elective';
import logger, { Log } from './logger';

interface IPassableData {
  electives: IElective[];
  students: IStudent[];
}

export enum Cycle {
  Required,
  TopChoice,
  Fill,
  Fix,
}

/**
 * Priority: 8, 7, 6
 * Required electives first, then the others
 * Required Cycle 1: Fill with 8th graders who need required
 * Other Cycle 1: Fill upto each grade cap by submit date
 * Other Cycle 2: Fill remaining spots by submit date
 */
async function initialSetup(): Promise<IPassableData> {
  logger.clear();
  const electivesP: Promise<IElective[]> = Elective.find()
    .populate('_group')
    .exec();
  const studentsP: Promise<IStudent[]> = Student.find({ submit: { $ne: null } })
    .sort('-grade submit')
    .populate('_user')
    .exec();
  const [electives, students] = await Promise.all([electivesP, studentsP]);
  electives.forEach((elective: IElective) => {
    elective.quartersdata = [
      {
        current: [0, 0, 0],
        students: [],
        names: [],
      },
      {
        current: [0, 0, 0],
        students: [],
        names: [],
      },
      {
        current: [0, 0, 0],
        students: [],
        names: [],
      },
      {
        current: [0, 0, 0],
        students: [],
        names: [],
      },
    ];
  });
  students.forEach((student: IStudent) => {
    student.electives = [null, null, null, null];
  });
  return { electives, students };
}

/**
 * Required Cycle
 * Force fills required electives for 8th graders
 */
function requiredCycle({ electives, students }: IPassableData): IPassableData {
  logger.log(Log.Head, 'REQUIRED CYCLE');
  const requiredElectives: IElective[] = _.filter(
    electives,
    (elective: IElective) => elective.required,
  );
  if (!requiredElectives.length) {
    logger.log(Log.Info, 'There are no required electives');
  }
  const grade8Students: IStudent[] = _.filter(
    students,
    (student: IStudent) => student.grade === 8,
  );
  Object.values(grade8Students).forEach(student => {
    const missing: IElective[] = _.filter(
      requiredElectives,
      (elective: IElective) =>
        !_.find(student.required, n => n.equals(elective._id)),
    );
    student.fillElectives(missing);
  });
  return { electives, students };
}

/**
 * First Choice
 * Atempt to give each student his/her first choice by grade/submit date
 */
function topChoiceCycle({ electives, students }: IPassableData): IPassableData {
  logger.log(Log.Head, 'TOP CHOICE CYCLE');
  Object.values(students).forEach(student => {
    const studentList: IList = student.get('list', Object);
    // Log the top choice for each quarter for current student iteration
    logger.log(
      Log.Info,
      `(${student.grade}) ${student.fullName()} wants: ${Object.values(
        _.mapValues(
          studentList,
          (quarterList: mongoose.Types.ObjectId[]) =>
            _.find(
              electives,
              (elective: IElective) =>
                elective.id === quarterList[0].toString(),
            ).name,
        ),
      ).join(', ')}`,
    );

    Object.keys(studentList)
      // Assign top choice electives in random order so top choices fill up evenly
      // instead of maxing out the first 2 quarters
      .sort(() => 0.5 - Math.random())
      .forEach((quarter: string) => {
        const elective: IElective = _.find(
          electives,
          (elec: IElective) => elec.id === student.list[quarter][0].toString(),
        );
        const index: number = +quarter[1] - 1;
        student.setElective(elective, index, 'TCC');
      });
  });

  return { electives, students };
}

/**
 * Fill Cycle
 * Fill remaining spots by grade/submit date
 */
function fillCycle({ electives, students }: IPassableData): IPassableData {
  logger.log(Log.Head, 'FILL CYCLE');
  Object.values(students).forEach(student => {
    if (student.electives.includes(null)) {
      logger.log(
        Log.Info,
        `(${student.grade}) ${student.fullName()}: Filling electives`,
      );
    }
    student.electives.forEach(
      (electiveId: mongoose.Types.ObjectId, index: number) => {
        if (!electiveId) {
          Object.keys(student.list[`q${index + 1}`].toObject()).some(j => {
            const elective = _.find(
              electives,
              elec => elec.id === student.list[`q${index + 1}`][j].toString(),
            );
            return student.setElective(elective, index, 'FC');
          });
        }
      },
    );
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
  students.forEach(student => {
    student.electives.forEach((electiveId, index) => {
      // Attempt to fill an empty Quarter 1 or 3 slot with semester long elective
      if (!electiveId && index % 2 === 0 && student.electives[index + 1]) {
        const removedElective = student.removeElective(index + 1, electives);
        Object.keys(student.list[`q${index + 1}`].toObject()).some(j => {
          const elective = _.find(
            electives,
            elec => elec.id === student.list[`q${index + 1}`][j].toString(),
          );
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
  students.forEach(student => {
    student.electives.forEach((elective, index) => {
      if (!elective)
        logger.error(
          `(${
            student.grade
          }) ${student.fullName()} :: Missing elective for Quarter ${index +
            1}`,
        );
    });
  });
  electives.forEach(elective => {
    elective.available.forEach(quarter => {
      if (elective.totalCurrent(+quarter - 1) > elective.cap) {
        logger.error(
          `${elective.name} (Quarter ${
            quarter
          }) :: Elective over cap (${elective.totalCurrent(+quarter - 1)} / ${
            elective.cap
          })`,
        );
      }
    });
  });
  return Student.find({ submit: null })
    .exec()
    .then(stus => {
      stus.forEach(student => {
        logger.error(
          `(${
            student.grade
          }) ${student.fullName()} :: Electives have not been submitted`,
        );
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
  electives.forEach(elective => {
    elective.available.forEach(avail => {
      logger.log(
        'INFO',
        `${elective.name} (Quarter ${avail}): ${
          elective.quartersdata[avail - 1].students.length
        } of ${elective.cap}`,
      );
      logger.log(
        'TEXT',
        `${elective.name} (Quarter ${avail}): ${elective.quartersdata[
          avail - 1
        ].names.join(', ')}`,
      );
    });
  });
  logger.log('HEAD', 'STUDENT SUMMARY');
  students.forEach(student => {
    let missing = false;
    const electivesArr = _.map(student.electives, id => {
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
    if (missing)
      logger.error(`(${student.grade}) ${student.fullName()}: ${elecStr}`);
    else
      logger.log(
        'INFO',
        `(${student.grade}) ${student.fullName()}: ${elecStr}`,
      );
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

    students.forEach(student => {
      student.save(err => {
        if (err) {
          reject(err);
        }
        count += 1;
        if (count >= total) {
          resolve();
        }
      });
    });
    electives.forEach(elective => {
      elective.save(err => {
        if (err) {
          reject(err);
        }
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

export default assignElectives;
