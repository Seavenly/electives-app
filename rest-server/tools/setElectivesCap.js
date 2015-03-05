'use strict';

var Elective = require('../models/elective');

module.exports = function(req, res) {
  Elective.find().exec().then(function(electives) {
    electives.forEach(function(elective) {
      elective.cap = +req.params.param;
      elective.save(function(err) {
        if (err) { res.send(err); }
      });
    });
    res.json({ message: 'Setting cap to '+req.params.param });
  });
};
