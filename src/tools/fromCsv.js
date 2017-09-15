/* eslint no-underscore-dangle: ["error", { "allow": ["_id", "_group", "_user"] }] */

const csvparse = require('csv-parse');
const fs = require('fs');
const actions = require('../actions/actions');
const Elective = require('../models/elective');
const User = require('../models/user');
const Student = require('../models/student');
const _ = require('lodash');

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
    .map((n) => {  // Replace [key, elective name] name with 'id'
      const elec = _.find(electives, { name: n[1] });
      if (!elec) throw new Error(`Elective ID could not be found for ${n[1]}`);
      if (!elec.available.includes(quarter)) throw new Error(`${n[1]} not available in quarter ${quarter}`);
      return elec._id;
    })
    .value(); // Return array of only elective ids
}

/**
 * Clear User and Student documents
 * @returns {Promise} promise
 */
function clearAllUsers() {
  return Promise.all([User.remove().exec(), Student.remove().exec()]);
}

/**
 * Convert csv file to array of entry objects
 * @returns {Promise} resolves array of entry objects
 */
function csvToCollection() {
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
 * @param {array} entries - from csvToCollection
 * @returns {Promise} see actions/students => createAll
 */
function generateUsers(entries) {
  const users = [];
  entries.forEach((entry, index) => {
    const name = entry['Student Name (First and Last)'].split(' ');
    const firstName = name[0].charAt(0).toUpperCase() + name[0].slice(1).toLowerCase();
    const lastName = name[1].charAt(0).toUpperCase() + name[1].slice(1).toLowerCase();
    const user = {
      name: {
        first: firstName,
        last: lastName,
      },
      grade: entry['Student Grade for 2017-2018 School Year'],
    };
    if (!name[0] || !name[1]) throw new Error(`Missing proper name (entry #${index + 1})`);
    if (_.find(users, { name: { first: firstName, last: lastName } })) throw new Error(`Multiple entries for ${name[0]} ${name[1]} (entry #${index + 1})`);
    users.push(user);
  });
  return actions.students.createAll(users).then(() => entries);
}

/**
 * Fill student elective lists based on json data
 * @param {array} entries - from csvToCollection
 * @returns {Promise} promise
 */
function fillElectiveLists(entries) {
  return Elective.find().then((electives) => {
    const updates = [];
    entries.forEach((entry) => {
      const q1 = extractList(entry, electives, 1);
      const q2 = extractList(entry, electives, 2);
      const q3 = extractList(entry, electives, 3);
      const q4 = extractList(entry, electives, 4);
      const name = entry['Student Name (First and Last)'].split(' ');
      const firstName = name[0].charAt(0).toUpperCase() + name[0].slice(1).toLowerCase();
      const lastName = name[1].charAt(0).toUpperCase() + name[1].slice(1).toLowerCase();
      const p = User.findOne({ name: { first: firstName, last: lastName } }).exec()
        .then((user) => {
          if (!user) throw new Error(`Unable to find user with name: ${firstName} ${lastName}`);
          return Student.findOne({ _id: user.data }).exec();
        })
        .then((student) => {
          const s = student;
          s.list = { q1, q2, q3, q4 };
          s.submit = new Date(entry.Timestamp);
          return s.save();
        });
      updates.push(p);
    });
    return Promise.all(updates);
  });
}

module.exports = () =>
  clearAllUsers()
    .then(csvToCollection)
    .then(generateUsers)
    .then(fillElectiveLists);
