/* eslint no-underscore-dangle: ["error", { "allow": ["_id", "_group"] }] */

const _ = require('lodash');
const mongoose = require('mongoose');
const Elective = require('../models/elective');
const ElectiveGroup = require('../models/electiveGroup');

// Reset electives using data from these files
const electives = require('../data/electives.json');
const groups = require('../data/groups.json');

/**
 * Reset electives using the electives JSON file
 * @returns {Promise} promise
 */
function resetElectives() {
  const p1 = ElectiveGroup.remove().exec();
  const p2 = Elective.remove().exec();

  return Promise.all([p1, p2]).then(() => Elective.insertMany(electives));
}

/**
 * Setup elective groups and link grouped electives to its group
 * @param {array} elecs - list of all electives in MongoDB
 * @returns {Promise} promise
 */
function setupGroups(elecs) {
  const groupsWithIds = [];
  const electivesWithGroups = [];

  groups.forEach((group) => {
    const g = group;
    g._id = mongoose.Types.ObjectId();
    groupsWithIds.push(g);

    group.electives.forEach((electiveName, i) => {
      const elec = _.find(elecs, { name: electiveName });

      g.electives[i] = elec._id;
      elec._group = g._id;
      electivesWithGroups.push(elec.save());
    });
  });

  return ElectiveGroup.insertMany(groupsWithIds).then(() => Promise.all(electivesWithGroups));
}

module.exports = () => resetElectives().then(setupGroups);
