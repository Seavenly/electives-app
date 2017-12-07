import _ from 'lodash';
import mongoose, { Schema, Document, Model } from 'mongoose';

import { IElective } from './Elective';
import { IElectiveGroup } from './ElectiveGroup';
import { IUser } from './User';
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
    default: [],
  },
});

export interface IList {
  [key: string]: mongoose.Types.ObjectId[];
  /** List of desired quarter 1 electives */
  q1: mongoose.Types.ObjectId[];
  /** List of desired quarter 2 electives */
  q2: mongoose.Types.ObjectId[];
  /** List of desired quarter 3 electives */
  q3: mongoose.Types.ObjectId[];
  /** List of desired quarter 4 electives */
  q4: mongoose.Types.ObjectId[];
}
export interface IStudent extends Document {
  /** Link to the related User Model */
  _user: mongoose.Types.ObjectId | IUser;
  /** Password required to submit an electives list */
  authPassword: string;
  /** Student's current grade */
  grade: number;
  /** List of required electives the student has completed */
  required: mongoose.Types.ObjectId[];
  /** Time of elective list submission */
  submit: Date;
  /** List of desired electives for each quartr */
  list: IList;
  /** Electives assigned to student for each quarter */
  electives: (mongoose.Types.ObjectId | undefined)[];
  /** Get the full name of the student */
  fullName(this: IStudent): string;
  /** Get the amount of times an elective or group has already been assinged to the student */
  electiveCount(this: IStudent, doc: IElective | IElectiveGroup): number;
  /** Return array of quarters the passed in elective was chosen by the student, ordered by prefernce */
  quartersForElective(this: IStudent, elective: IElective): number[];
  /** Attempt to fill missing elective slots for student, return true if successful */
  fillElectives(this: IStudent, electives: IElective[]): boolean;
  /** Set student elective data at index */
  setElective(
    this: IStudent,
    elective: IElective,
    index: number,
    cycle: Cycle,
  ): boolean;
  /** Remove student elective data at index */
  removeElective(
    this: IStudent,
    index: number,
    electives: IElective[],
  ): IElective | undefined;
}

StudentSchema.methods.fullName = function fullName(): string {
  if (typeof this._user === 'string') {
    throw new Error('The _user field has not been populated');
  }
  const user: IUser = this._user as IUser;
  return `${user.name.first} ${user.name.last}`;
} as IStudent['fullName'];

StudentSchema.methods.electiveCount = function electiveCount(
  doc: IElective | IElectiveGroup,
): number {
  // const student = this.toObject();
  const model: Model<IElective | IElectiveGroup> = doc.constructor as Model<
    any
  >;
  let semesterCheck = 0;

  if (model.modelName === 'ElectiveGroup') {
    return _.filter(this.electives, n => {
      const elective = _.find(
        (doc as IElectiveGroup).electives,
        elecId => n !== undefined && elecId.equals(n),
      );
      if (n && elective) {
        // if (elective.semester) {
        //   return (semesterCheck += 1) % 2 === 0;
        // }
        throw new Error('electiveCount function needs to be fixed');
        return true;
      }
      return false;
    }).length;
  }
  return _.filter(this.electives, n => {
    if (n && n.equals(doc._id)) {
      if ((doc as IElective).semester) {
        return (semesterCheck += 1) % 2 === 0;
      }
      return true;
    }
    return false;
  }).length;
} as IStudent['electiveCount'];

StudentSchema.methods.quartersForElective = function quartersForElectives(
  elective: IElective,
) {
  if (elective.id === undefined) {
    throw new Error(`Elective ${elective.name} has no id assigned to it`);
  }
  const electiveId: string = elective.id;
  const electiveLocations: { pref: number; quarter: number }[] = [];
  const list: IList = this.list;

  // Iterate over each student's elective list (4 total)
  Object.values(list).forEach(quarter => {
    // Ids for each elective of current list
    const stringIds = _.map(quarter, objectID => objectID.toString());
    // Student's preference for each elective
    const pref: number = _.indexOf(stringIds, electiveId) + 1;
    if (pref !== 0) {
      electiveLocations.push({
        pref,
        quarter: +quarter[1],
      });
    }
  });
  return _.map(_.sortBy(electiveLocations, 'pref'), 'quarter');
} as IStudent['quartersForElective'];

StudentSchema.methods.fillElectives = function fillElectives(
  electives: IElective[],
): boolean {
  // cycle through each missing elective id
  const results: boolean[] = electives.map(elective => {
    const quarters = this.quartersForElective(elective);

    // cycle through student's quarter pref for each elective id
    let index;
    for (const quarter of quarters) {
      index = quarter - 1;
      if (this.setElective(elective, index, Cycle.FILL)) {
        return true;
      }
    }
    // student's prefs not available, put student in elective for any open quarter
    const rest = _.difference(elective.available, quarters);
    for (const r of rest) {
      index = r - 1;
      if (this.setElective(elective, index, Cycle.FILL)) {
        return true;
      }
    }
    logger.error(`Unable to assign ${this.fullName()} to ${elective.name}`);
    return false;
  });
  return results.every(bool => bool);
} as IStudent['fillElectives'];

/** Checks for errors and sends them to the logger */
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
    logger.log(Log.GRADE, `${messageStart} Incorrect correct grade`);
    return false;
  }
  if (student.electives[index]) {
    logger.log(
      Log.FILLED,
      `${messageStart} Already assigned for Quarter ${index + 1}`,
    );
    return false;
  }
  if (elective.semester && student.electives[index + 1]) {
    logger.log(
      Log.SEMI,
      `${messageStart} Already assigned for Quarter ${index + 2}`,
    );
    return false;
  }
  if (elective.totalCurrent(index + 1) >= elective.cap) {
    logger.log(
      Log.FULL,
      `${messageStart} Elective is full (${
        elective.quartersdata[index].students.length
      } of ${elective.cap})`,
    );
    return false;
  }
  if (cycle === Cycle.TOP_CHOICE) {
    if (elective._group) {
      // _group is usually an ObjectId, however, it has been
      // populated from mongoose as the ElectiveGroup
      const group: IElectiveGroup = elective._group as IElectiveGroup;
      if (group.limit > 0 && student.electiveCount(group) >= group.limit) {
        logger.log(
          Log.LIMIT,
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
        Log.LIMIT,
        `${messageStart} Initial limit for ${elective.name} reached`,
      );
      return false;
    }
    if (
      elective.quartersdata[index].current[student.grade - 6] + 1 >
      elective.cap / elective.grades.length
    ) {
      logger.log(
        Log.TCC_FULL,
        `${messageStart} Full to 1/${elective.grades.length} for ${
          student.grade
        }th graders`,
      );
      return false;
    }
  }
  return true;
}

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
      Log.SUCCESS,
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
  index: number,
  electives: IElective[],
): IElective | undefined {
  if (this.electives[index] === null) {
    logger.error(
      `(${this.grade}) ${this.fullName()} has no elective for Quarter ${index +
        1} to remove`,
    );
    return undefined;
  }
  const nonNullElective = this.electives[index] as mongoose.Types.ObjectId;
  const elective = _.find(
    electives,
    elec => elec.id === nonNullElective.toString(),
  );
  this.set({
    electives: {
      [index]: null,
    },
  });
  if (elective === undefined) {
    throw new Error(
      'An elective is missing from the database or has been improperly assigned',
    );
  }
  // Remove reference to semester elecive spanning two quarters
  if (elective.semester) {
    this.set({
      electives: {
        [index + 1]: null,
      },
    });
  }
  // Subtract 1 student from the electives current count of students
  elective.set({
    quartersdata: {
      [index]: {
        current: {
          [this.grade - 6]:
            elective.quartersdata[index].current[this.grade - 6] - 1,
        },
      },
    },
  });
  elective.quartersdata[index].students.splice(
    _.findIndex(
      elective.quartersdata[index].students,
      studentId => studentId.toString() === this.id,
    ),
    1,
  );

  logger.log(
    Log.REMOVE,
    `(${this.grade}) ${this.fullName()} :: ${elective.name} (Quarter ${index +
      1}) :: Elective removed`,
  );
  return elective;
} as IStudent['removeElective'];

const Student: Model<IStudent> = mongoose.model('Student', StudentSchema);
export default Student;
