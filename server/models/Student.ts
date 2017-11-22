import * as _ from 'lodash';
import mongoose, { Schema, Document, Model } from 'mongoose';
import { IElective } from './Elective';
import { IElectiveGroup } from './ElectiveGroup';
import logger, { Log } from '../tools/logger';
import { Cycle } from '../tools/assignElectives';

const StudentSchema: Schema = new Schema({
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
  electives: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Elective' }],
    default: [null, null, null, null],
  }, // ids
});

export interface IList {
  [key: string]: mongoose.Types.ObjectId[];
  q1: mongoose.Types.ObjectId[];
  q2: mongoose.Types.ObjectId[];
  q3: mongoose.Types.ObjectId[];
  q4: mongoose.Types.ObjectId[];
}
export interface IStudent extends Document {
  _user: mongoose.Types.ObjectId;
  authPassword: string;
  grade: number;
  required: mongoose.Types.ObjectId[];
  submit: Date;
  list: IList;
  electives: mongoose.Types.ObjectId[];
  fullName: () => string;
  electiveCount: (doc: IElective | IElectiveGroup) => number;
  quartersForElective: (elective: IElective) => number[];
  fillElectives: (electives: IElective[]) => void;
  setElective: (elective: IElective, index: number, cycle: Cycle) => boolean;
  removeElective: (index: number, electives: IElective[]) => IElective;
}

StudentSchema.methods.fullName = function fullName(): string {
  if (typeof this._user !== 'string') {
    return `${this._user.name.first} ${this._user.name.last}`;
  }
  return null;
};

StudentSchema.methods.electiveCount = function electiveCount(
  this: IStudent,
  doc: IElective | IElectiveGroup,
): number {
  // const student = this.toObject();
  const model: Model<IElective | IElectiveGroup> = doc.constructor as Model<
    any
  >;
  let semesterCheck = 0;

  if (model.modelName === 'ElectiveGroup') {
    return _.filter(this.electives, n => {
      const elective = _.find((doc as IElectiveGroup).electives, a =>
        a.equals(n),
      );
      if (n && elective) {
        if (elective.semester) {
          return (semesterCheck += 1) % 2 === 0;
        }
        return true;
      }
      return false;
    }).length;
  }
  return _.filter(student.electives, n => {
    if (n && n.equals(doc._id)) {
      if (doc.semester) {
        return (semesterCheck += 1) % 2 === 0;
      }
      return true;
    }
    return false;
  }).length;
};

/*
  Return array of quarters the student selected the passed in elective
  ordered by pref
*/
StudentSchema.methods.quartersForElective = function quartersForElectives(
  elective,
) {
  const student = this;
  const electiveId = elective.id;
  const electiveLocations = [];
  const listObj = student.list.toObject();

  Object.values(listObj).forEach(quarter => {
    const stringIds = _.map(student.list[quarter], objectID =>
      objectID.toString(),
    );
    const pref = _.indexOf(stringIds, electiveId) + 1;
    if (pref !== 0) {
      electiveLocations.push({
        pref,
        quarter: +quarter[1],
      });
    }
  });
  return _.map(_.sortBy(electiveLocations, 'pref'), 'quarter');
};

StudentSchema.methods.fillElectives = function fillElectives(electives) {
  const student = this;

  // cycle through each missing elective id
  electives.forEach(elective => {
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
      if (student.setElective(elective, index)) {
        return;
      }
    }
    logger.error(`Unable to assign ${student.fullName()} to ${elective.name}`);
  });
};

/**
 * Checks for errors and sends them to the logger
 */
function checks(
  student: IStudent,
  cycle: Cycle,
  elective: IElective,
  index: number,
): boolean {
  const messageStart: string = `(${student.grade}) ${student.fullName()} :: ${
    elective.name
  } (Quarter ${index + 1}) ::`;
  if (elective.grades.indexOf(student.grade) === -1) {
    logger.log(Log.Grade, `${messageStart} Incorrect correct grade`);
    return false;
  }
  if (student.electives[index]) {
    logger.log(
      Log.Filled,
      `${messageStart} Already assigned for Quarter ${index + 1}`,
    );
    return false;
  }
  if (elective.semester && student.electives[index + 1]) {
    logger.log(
      Log.Semi,
      `${messageStart} Already assigned for Quarter ${index + 2}`,
    );
    return false;
  }
  if (elective.totalCurrent(index) >= elective.cap) {
    logger.log(
      Log.Full,
      `${messageStart} Elective is full (${
        elective.quartersdata[index].students.length
      } of ${elective.cap})`,
    );
    return false;
  }
  if (cycle === Cycle.TopChoice) {
    if (elective._group) {
      // _group is usually an ObjectId, however, it has been
      // populated from mongoose as the ElectiveGroup
      const group: IElectiveGroup = elective._group as IElectiveGroup;
      if (group.limit > 0 && student.electiveCount(group) >= group.limit) {
        logger.log(
          Log.Limit,
          `${messageStart} Initial limit for ${group.name} (group) reached`,
        );
        return false;
      }
    }
    if (
      elective.limit > 0 &&
      student.electiveCount(elective) >= elective.limit
    ) {
      logger.log(
        Log.Limit,
        `${messageStart} Initial limit for ${elective.name} reached`,
      );
      return false;
    }
    if (
      elective.quartersdata[index].current[student.grade - 6] + 1 >
      elective.cap / elective.grades.length
    ) {
      logger.log(
        Log.TCCFull,
        `${messageStart} Full to 1/${elective.grades.length} for ${
          student.grade
        }th graders`,
      );
      return false;
    }
  }
  return true;
}

/**
 * Set student elective data at index
 */
StudentSchema.methods.setElective = function setElective(
  this: IStudent,
  elective: IElective,
  index: number,
  cycle: Cycle,
) {
  if (checks(this, cycle, elective, index)) {
    this.set({
      electives: {
        [index]: elective._id,
      },
    });
    // If assigned elective is a semester long, assign it to the next quarter also
    if (elective.semester) {
      this.set({
        electives: {
          [index + 1]: elective._id,
        },
      });
    }
    // Add to total count of students in grade for elective
    // Used for calculating the limits for each grade
    elective.set({
      quartersdata: {
        [index]: {
          current: {
            [this.grade - 6]:
              elective.quartersdata[index].current[this.grade - 6] + 1,
          },
        },
      },
    });
    elective.quartersdata[index].students.push(this._id);
    elective.quartersdata[index].names.push(this.fullName());

    logger.log(
      Log.Success,
      `(${this.grade}) ${this.fullName()} :: ${elective.name} (Quarter ${index +
        1}) :: Elective assigned (${
        elective.quartersdata[index].students.length
      } of ${elective.cap})`,
    );
    return true;
  }
  return false;
};

StudentSchema.methods.removeElective = function removeElective(
  index,
  electives,
) {
  const student = this;
  if (!student.electives[index]) {
    logger.error(
      `(${
        student.grade
      }) ${student.fullName()} has no elective for Quarter ${index +
        1} to remove`,
    );
    return false;
  }
  const elective = _.find(
    electives,
    elec => elec.id === student.electives[index].toString(),
  );
  student.electives.set(index, null);

  if (elective.semester) {
    student.electives.set(index + 1, null);
  }
  elective.quartersdata[index].current.set(
    student.grade - 6,
    elective.quartersdata[index].current[student.grade - 6] - 1,
  );
  elective.quartersdata[index].students.splice(
    _.findIndex(
      elective.quartersdata[index].students,
      studentId => studentId.toString() === student.id,
    ),
    1,
  );

  logger.log(
    'REMOVE',
    `(${student.grade}) ${student.fullName()} :: ${
      elective.name
    } (Quarter ${index + 1}) :: Elective removed`,
  );
  return elective;
};

const Student: Model<IStudent> = mongoose.model('Student', StudentSchema);
export default Student;
