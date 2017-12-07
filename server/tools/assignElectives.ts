/* eslint no-underscore-dangle: ["error", { "allow": ["_id", "_group"] }] */

import mongoose, { Promise } from 'mongoose';
import Student, { IStudent, IList } from '../models/Student';
import Elective, { IElective } from '../models/Elective';
import logger, { Log, Logs, Errors } from './logger';

interface IPassableData {
  electives: IElective[];
  students: IStudent[];
}

export enum Cycle {
  REQUIRED,
  TOP_CHOICE,
  FILL,
  FIX,
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
  const [electives, students]: [IElective[], IStudent[]] = await Promise.all([
    electivesP,
    studentsP,
  ]);
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
    student.electives = [];
    student.electives.length = 4;
  });
  return { electives, students };
}

/**
 * Required Cycle
 * Force fills required electives for 8th graders
 */
function requiredCycle({ electives, students }: IPassableData): IPassableData {
  logger.log(Log.HEAD, 'REQUIRED CYCLE');
  const requiredElectives: IElective[] = electives.filter(
    (elective: IElective) => elective.required,
  );
  if (!requiredElectives.length) {
    logger.log(Log.INFO, 'There are no required electives');
  }
  const grade8Students: IStudent[] = students.filter(
    (student: IStudent) => student.grade === 8,
  );
  Object.values(grade8Students).forEach(student => {
    const missing: IElective[] = requiredElectives.filter(
      (elective: IElective) =>
        !student.required.find(n => n.equals(elective._id)),
    );
    student.fillElectives(missing);
  });
  return { electives, students };
}

/**
 * Top Choice
 * Atempt to give each student his/her first choice by grade/submit date
 */
function topChoiceCycle({ electives, students }: IPassableData): IPassableData {
  logger.log(Log.HEAD, 'TOP CHOICE CYCLE');
  Object.values(students).forEach(student => {
    const studentList: IList = student.get('list', Object);
    // Log the top choice for each quarter for current student iteration
    logger.log(
      Log.INFO,
      `(${student.grade}) ${student.fullName()} wants: ${Object.values(
        studentList,
      )
        .map(quarterList => {
          const elective = electives.find(
            elec => elec.id === quarterList[0].toHexString(),
          );
          return elective !== undefined ? elective.name : '';
        })
        .join(', ')}`,
    );

    Object.keys(studentList)
      // Assign top choice electives in random order so top choices fill up evenly
      // instead of maxing out the first 2 quarters
      .sort(() => 0.5 - Math.random())
      .forEach((quarter: string) => {
        const elective: IElective | undefined = electives.find(
          (elec: IElective) => elec.id === student.list[quarter][0].toString(),
        );
        const index: number = +quarter[1] - 1;
        if (elective === undefined) {
          throw new Error(
            `The student, ${student.fullName()}, has an invalid elective ID for quarter ${
              quarter
            } in the first slot`,
          );
        }
        student.setElective(elective, index, Cycle.TOP_CHOICE);
      });
  });

  return { electives, students };
}

/**
 * Fill Cycle
 * Fill remaining spots by grade/submit date
 */
function fillCycle({ electives, students }: IPassableData): IPassableData {
  logger.log(Log.HEAD, 'FILL CYCLE');
  Object.values(students).forEach(student => {
    if (student.electives.includes(undefined)) {
      logger.log(
        Log.INFO,
        `(${student.grade}) ${student.fullName()}: Filling electives`,
      );
      student.electives.forEach((electiveId, index) => {
        if (electiveId === undefined) {
          student.list[`q${index + 1}`].some((id: mongoose.Types.ObjectId) => {
            const elective = electives.find(elec => elec.id === id.toString());
            if (elective === undefined) {
              throw new Error(
                `${student.fullName()}'s list for quarter ${index +
                  1} has an invalid elective ID that does not map to an actual elective.`,
              );
            }
            return student.setElective(elective, index, Cycle.FILL);
          });
        }
      });
    }
  });

  return { electives, students };
}

/**
 * Fix Cycle
 * Attempt to fix potential errors
 */
function fixCycle({ electives, students }: IPassableData): IPassableData {
  logger.log(Log.HEAD, 'FIX CYCLE');
  students.forEach(student => {
    student.electives.forEach((electiveId, index) => {
      // Attempt to fill an empty Quarter 1 or 3 slot with semester long elective
      if (!electiveId && index % 2 === 0 && student.electives[index + 1]) {
        const removedElective = student.removeElective(index + 1, electives);
        student.list[`q${index + 1}`].some((id: mongoose.Types.ObjectId) => {
          const elective = electives.find(elec => elec.id === id.toString());
          if (elective === undefined) {
            throw new Error(
              `${student.fullName()}'s list for quarter ${index +
                1} has an invalid elective ID that does not map to an actual elective.`,
            );
          }
          return student.setElective(elective, index, Cycle.FIX);
        });
        if (removedElective !== undefined) {
          student.setElective(removedElective, index + 1, Cycle.FIX);
        }
      }
    });
  });

  return { electives, students };
}

/**
 * Find errors in assigned electives and report them
 */
async function findErrors({
  electives,
  students,
}: IPassableData): Promise<IPassableData> {
  students.forEach(student => {
    student.electives.forEach((electiveId, index) => {
      if (electiveId === undefined) {
        logger.error(
          `(${
            student.grade
          }) ${student.fullName()} :: Missing elective for Quarter ${index +
            1}`,
        );
      }
    });
  });
  electives.forEach(elective => {
    elective.available.forEach(quarter => {
      if (elective.totalCurrent(+quarter) > elective.cap) {
        logger.error(
          `${elective.name} (Quarter ${
            quarter
          }) :: Elective over cap (${elective.totalCurrent(+quarter)} / ${
            elective.cap
          })`,
        );
      }
    });
  });
  const studentsNoSubmit = await Student.find({ submit: null }).exec();
  studentsNoSubmit.forEach(student => {
    logger.error(
      `(${
        student.grade
      }) ${student.fullName()} :: Electives have not been submitted`,
    );
  });
  return { electives, students };
}

/**
 * Log each students' assigned electives
 */
function logSummary({ electives, students }: IPassableData): IPassableData {
  logger.log(Log.HEAD, 'ELECTIVE SUMMARY');
  electives.forEach(elective => {
    elective.available.forEach(avail => {
      logger.log(
        Log.INFO,
        `${elective.name} (Quarter ${avail}): ${
          elective.quartersdata[avail - 1].students.length
        } of ${elective.cap}`,
      );
      logger.log(
        Log.TEXT,
        `${elective.name} (Quarter ${avail}): ${elective.quartersdata[
          avail - 1
        ].names.join(', ')}`,
      );
    });
  });
  logger.log(Log.HEAD, 'STUDENT SUMMARY');
  students.forEach(student => {
    let missing = false;
    const electiveNames: string[] = student.electives.map(id => {
      if (id === undefined) {
        missing = true;
        return '(MISSING)';
      }
      const elective = electives.find(elec => elec.id === id.toString());
      if (elective === undefined) {
        throw new Error(
          `Log Summary: ${student.fullName()} has an invalid elective ID set.`,
        );
      }
      return elective.name;
    });
    let elecStr = '';
    electiveNames.forEach((elec, i) => {
      elecStr += `Q${i + 1}: ${elec}`;
      if (i < electiveNames.length - 1) {
        elecStr += ', ';
      }
    });
    if (missing) {
      logger.error(`(${student.grade}) ${student.fullName()}: ${elecStr}`);
    } else {
      logger.log(
        Log.INFO,
        `(${student.grade}) ${student.fullName()}: ${elecStr}`,
      );
    }
  });

  return { electives, students };
}

/**
 * Save all changes to students' electives
 */
function save({ electives, students }: IPassableData): Promise<void> {
  const savedStudents: Promise<IStudent>[] = students.map(student =>
    student.save(),
  );
  const savedElectives: Promise<IElective>[] = electives.map(elective =>
    elective.save(),
  );
  return Promise.all([...savedStudents, ...savedElectives]).catch(
    (err: string) => {
      throw new Error(err);
    },
  );
}

/**
 * Assign electives to students based on their desired choices
 */
async function assignElectives(): Promise<{ log: Logs; errors: Errors }> {
  let data: IPassableData = await initialSetup();
  data = requiredCycle(data);
  data = topChoiceCycle(data);
  data = fillCycle(data);
  data = fixCycle(data);
  data = await findErrors(data);
  data = logSummary(data);
  await save(data);

  if (logger.getErrors().length) {
    logger.log(Log.ERROR, 'Electives calculated WITH ERRORS');
  } else {
    logger.log(Log.SUCCESS, 'Electives calculated successfully');
  }
  return { log: logger.getLog(), errors: logger.getErrors() };
}

export default assignElectives;
