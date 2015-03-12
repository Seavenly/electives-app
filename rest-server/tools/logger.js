'use strict';

var log = [];
var errors = [];
var hasErrors = false;
var line = 1;

var logger = {
  log: function(type, message) {
    if (typeof type === 'undefined') { type = 'INFO'; }
    log.push([line, type, message]);
    line++;
  },

  getLog: function() {
    return log;
  },

  error: function(message) {
    this.log('ERROR', message);
    hasErrors = true;
  },

  hasErrors: function() {
    return hasErrors;
  },

  clear: function() {
    log = [];
    errors = [];
    hasErrors = false;
    line = 1;
  }
};

module.exports = logger;
