/* eslint no-underscore-dangle: ["error", { "allow": ["_id", "_group", "_user"] }] */

import fs from 'fs';
import csvparse from 'csv-parse';
import mongoose from 'mongoose';

import actions from '../actions/actions';
import Elective, { IElective } from '../models/Elective';
import User, { IUser, IBasicUserInfo } from '../models/User';
import Student, { IStudent } from '../models/Student';

/** Create elective list for quarter from CSV entry */
function extractList(
  entry: ICSVEntry,
  electives: IElective[],
  quarter: number,
): mongoose.Types.ObjectId[] {
  // Find keys pertaining to specified quarter and sort them
  const keysForQuarter: string[] = Object.keys(entry)
    .filter(key => key.indexOf(`Quarter ${quarter}`) > -1)
    .sort();

  // Find elective ID for each key
  return keysForQuarter.map(key => {
    const electiveChoice: IElective | undefined = electives.find(
      elective => elective.name === entry[key],
    );
    if (electiveChoice === undefined) {
      throw new Error(`Elective could not be found with name ${entry[key]}.`);
    }
    if (!electiveChoice.available.includes(quarter)) {
      throw new Error(`${entry[key]} is not available in quarter ${quarter}.`);
    }
    return electiveChoice._id;
  });
}

/**
 * Clear User and Student documents
 */
function clearAllUsers(): Promise<[void, void]> {
  return Promise.all([User.remove({}).exec(), Student.remove({}).exec()]);
}

const enum CSVEntryColumn {
  TIMESTAMP = 'Timestamp',
  NAME = 'Student Name (First and Last)',
  GRADE = 'Student Grade for 2017-2018 School Year',
  Q1C1 = 'Quarter 1 Choices [Choice 1]',
  Q1C2 = 'Quarter 1 Choices [Choice 2]',
  Q1C3 = 'Quarter 1 Choices [Choice 3]',
  Q2C1 = 'Quarter 2 Choices [Choice 1]',
  Q2C2 = 'Quarter 2 Choices [Choice 2]',
  Q2C3 = 'Quarter 2 Choices [Choice 3]',
  Q3C1 = 'Quarter 3 Choices [Choice 1]',
  Q3C2 = 'Quarter 3 Choices [Choice 2]',
  Q3C3 = 'Quarter 3 Choices [Choice 3]',
  Q4C1 = 'Quarter 4 Choices [Choice 1]',
  Q4C2 = 'Quarter 4 Choices [Choice 2]',
  Q4C3 = 'Quarter 4 Choices [Choice 3]',
}
interface ICSVEntry {
  [index: string]: string;
  Timestamp: string;
  'Student Name (First and Last)': string;
  'Student Grade for 2017-2018 School Year': string;
  'Quarter 1 Choices [Choice 1]': string;
  'Quarter 1 Choices [Choice 2]': string;
  'Quarter 1 Choices [Choice 3]': string;
  'Quarter 2 Choices [Choice 1]': string;
  'Quarter 2 Choices [Choice 2]': string;
  'Quarter 2 Choices [Choice 3]': string;
  'Quarter 3 Choices [Choice 1]': string;
  'Quarter 3 Choices [Choice 2]': string;
  'Quarter 3 Choices [Choice 3]': string;
  'Quarter 4 Choices [Choice 1]': string;
  'Quarter 4 Choices [Choice 2]': string;
  'Quarter 4 Choices [Choice 3]': string;
}
/**
 * Convert csv file to array of entry objects
 */
function csvToCollection(): Promise<ICSVEntry[]> {
  const file = fs.readFileSync('new/data/entries.csv', 'utf8');
  return new Promise((resolve, reject) => {
    csvparse(file, { columns: true }, (err, data) => {
      if (err) {
        reject('Error parsing entries.csv');
      }
      resolve(data);
    });
  });
}

/** Generate array of basic user info from CSV entries */
async function generateUsers(entries: ICSVEntry[]): Promise<IUser[]> {
  const users: IBasicUserInfo[] = entries.map((entry, index) => {
    const [firstName, lastName] = entry[CSVEntryColumn.NAME].split(' ');
    const firstNameCapitalized =
      firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    const lastNameCapitalized =
      lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
    if (firstName === undefined || lastName === undefined) {
      throw new Error(`Missing proper name (entry #${index + 1})`);
    }
    if (
      users.find(
        user =>
          user.name.first === firstNameCapitalized &&
          user.name.last === lastNameCapitalized,
      )
    ) {
      throw new Error(
        `Multiple entries for ${firstNameCapitalized} ${
          lastNameCapitalized
        } (entry #${index + 1})`,
      );
    }
    return {
      name: {
        first: firstNameCapitalized,
        last: lastNameCapitalized,
      },
      grade: entry[CSVEntryColumn.GRADE],
    };
  });
  return actions.students.createAll(users);
}

/** Fill student elective lists based on json data */
async function fillElectiveLists(entries: ICSVEntry[]): Promise<IStudent[]> {
  const electives: IElective[] = await Elective.find();
  const updates = entries.map(entry => {
    const q1 = extractList(entry, electives, 1);
    const q2 = extractList(entry, electives, 2);
    const q3 = extractList(entry, electives, 3);
    const q4 = extractList(entry, electives, 4);
    const name = entry[CSVEntryColumn.NAME].split(' ');
    const firstName =
      name[0].charAt(0).toUpperCase() + name[0].slice(1).toLowerCase();
    const lastName =
      name[1].charAt(0).toUpperCase() + name[1].slice(1).toLowerCase();
    return User.findOne({ name: { first: firstName, last: lastName } })
      .exec()
      .then(user => {
        if (user === null) {
          throw new Error(
            `Unable to find user with name: ${firstName} ${lastName}`,
          );
        }
        return Student.findOne({ _id: user.data }).exec();
      })
      .then(student => {
        if (student === null) {
          throw new Error(
            `No student linked to user with name: ${firstName} ${lastName}`,
          );
        }
        student.list = { q1, q2, q3, q4 };
        student.submit = new Date(entry[CSVEntryColumn.TIMESTAMP]);
        return student.save();
      });
  });
  return Promise.all(updates);
}

export default async (): Promise<IStudent[]> => {
  await clearAllUsers();
  const entries: ICSVEntry[] = await csvToCollection();
  await generateUsers(entries);
  return fillElectiveLists(entries);
};
