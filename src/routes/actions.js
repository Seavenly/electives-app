const tools = require('../tools/tools');

const actions = {
  electives: {
    calculate: (req, res) => tools.assignElectives(req, res),
    reset: (req, res) => tools.resetElectives(req, res),
    setCap: (req, res) => tools.setElectivesCap(req, res),
    log: (req, res) => tools.logElectives(req, res),
  },

  students: {
    setLists: (req, res) => tools.setStudentLists(req, res),
    randomizeLists: (req, res) => tools.randomizeStudentLists(req, res),
    log: (req, res) => tools.logStudents(req, res),
  },
};

module.exports = actions;
