'use strict';

var assignElectives       = require('./assignElectives');
var resetElectives        = require('./resetElectives');
var setElectivesCap       = require('./setElectivesCap');
var setStudentLists       = require('./setStudentLists');
var randomizeStudentLists = require('./randomizeStudentLists');
var logElectives          = require('./logElectives');

module.exports = {
  assignElectives: assignElectives,
  resetElectives: resetElectives,
  setElectivesCap: setElectivesCap,
  setStudentLists: setStudentLists,
  randomizeStudentLists: randomizeStudentLists,
  logElectives: logElectives
};
