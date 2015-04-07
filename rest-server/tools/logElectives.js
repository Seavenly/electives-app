'use strict';

var logger = require('./logger');
var Elective = require('../models/elective');

module.exports = function(req, res) {
  logger.clear();
  Elective.find().exec().then(function(electives) {
    return res.json(electives);
  });
};
