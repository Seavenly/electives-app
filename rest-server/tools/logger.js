'use strict';

var log = [];
var errors = [];

var logger = {
  log: function(message) {
    log.push(message);
  },

  getLog: function() {
    return log;
  },

  error: function(message) {
    errors.push(message);
  },

  getErrors: function() {
    return errors;
  }
};

module.exports = logger;
