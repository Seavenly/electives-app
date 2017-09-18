const logger = require('./logger');
const Elective = require('../models/elective');

module.exports = (req, res) => {
  logger.clear();
  Elective.find().exec().then(electives => res.json(electives));
};
