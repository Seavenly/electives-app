'use strict';

var tools = require('../tools/tools');


var actions = {

  electives: {
    calculate: function(req, res) {
      tools.assignElectives(req, res);
    },

    reset: function(req, res) {
      tools.resetElectives(req, res);
    },

    setCap: function(req, res) {
      tools.setElectivesCap(req, res);
    },

    log: function(req, res) {
      tools.logElectives(req, res);
    }
  },

  students: {
    setLists: function(req, res) {
      tools.setStudentLists(req, res);
    },

    randomizeLists: function(req, res) {
      tools.randomizeStudentLists(req, res);
    },
    
    log: function(req, res) {
      tools.logStudents(req, res);
    }
  }
};

module.exports = actions;
