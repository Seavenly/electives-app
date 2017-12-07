/* eslint no-underscore-dangle: ["error", { "allow": ["_id", "_group", "_user"] }] */

import fs from 'fs';
import csvparse from 'csv-parse';
import _ from 'lodash';

import actions from '../actions/actions';
import Elective from '../models/Elective';
import User, { IBasicUserInfo } from '../models/User';
import Student from '../models/Student';

/**
 * Create elective list for quarter from entry json
 * @param {object} entry - json object
 * @param {object} electives - list of all electives
 * @param {number} quarter - quarter to filter by
 * @returns {array} Elective list in order by elective name
 */
function extractList(entry, electives, quarter) {
  return _(entry)
    .pickBy((value, key) => key.indexOf(`Quarter ${quarter}`) > -1 && value) // Pick keys with quarter in name
    .toPairs() // Convert key, value to collection of arrays [key, value]
    .sortBy(0) // Sort array by the 'key'
    .map(n => {
      // Replace [key, elective name] name with 'id'
      const elec = _.find(electives, { name: n[1] });
      if (!elec) throw new Error(`Elective ID could not be found for ${n[1]}`);
      if (!elec.available.includes(quarter))
        throw new Error(`${n[1]} not available in quarter ${quarter}`);
      return elec._id;
    })
    .value(); // Return array of only elective ids
}

/**
 * Clear User and Student documents
 * @returns {Promise} promise
 */
function clearAllUsers(): Promise<[void, void]> {
  return Promise.all([User.remove({}).exec(), Student.remove({}).exec()]);
}

const enum CSVEntryColumn {
  NAME = 'Student Name (First and Last)',
  GRADE = 'Student Grade for 2017-2018 School Year',
}
interface ICSVEntry {
  'Student Name (First and Last)': string;
  'Student Grade for 2017-2018 School Year': string;
}
/**
 * Convert csv file to array of entry objects
 */
function csvToCollection(): Promise<ICSVEntry[]> {
  const file = fs.readFileSync('new/data/entries.csv', 'utf8');
  return new Promise((resolve, reject) => {
    csvparse(file, { columns: true }, (err, data) => {
      if (err) reject('Error parsing entries.csv');
      resolve(data);
    });
  });
}

/**
 * Generate array of users from data json
 */
async function generateUsers(entries: ICSVEntry[]): Promise<ICSVEntry[]> {
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
        `Multiple entries for ${firstNameCapitalized} ${lastNameCapitalized} (entry #${index +
          1})`,
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
  await actions.students.createAll(users);
  return entries;
}

/**
 * Fill student elective lists based on json data
 * @param {array} entries - from csvToCollection
 * @returns {Promise} promise
 */
async function fillElectiveLists(entries: ICSVEntry[]) {
  const electives = await Elective.find();
  const updates = [];
  entries.forEach(entry => {
    const q1 = extractList(entry, electives, 1);
    const q2 = extractList(entry, electives, 2);
    const q3 = extractList(entry, electives, 3);
    const q4 = extractList(entry, electives, 4);
    const name = entry[CSVEntryColumn.NAME].split(' ');
    const firstName =
      name[0].charAt(0).toUpperCase() + name[0].slice(1).toLowerCase();
    const lastName =
      name[1].charAt(0).toUpperCase() + name[1].slice(1).toLowerCase();
    const p = User.findOne({ name: { first: firstName, last: lastName } })
      .exec()
      .then(user => {
        if (!user)
          throw new Error(
            `Unable to find user with name: ${firstName} ${lastName}`,
          );
        return Student.findOne({ _id: user.data }).exec();
      })
      .then(student => {
        const s = student;
        s.list = { q1, q2, q3, q4 };
        s.submit = new Date(entry.Timestamp);
        return s.save();
      });
    updates.push(p);
  });
  return Promise.all(updates);
}

module.exports = () =>
  clearAllUsers()
    .then(csvToCollection)
    .then(generateUsers)
    .then(fillElectiveLists);
