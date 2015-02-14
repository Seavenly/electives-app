'use strict';

var Elective = require('../models/elective');

var electives = {

  create: function(req, res) {
    Elective.findOne({ name: req.body.name }, function(err, elective) {
      if (err) { res.send(err); }
      if (elective) { return res.json({ message: 'An elective by that name aready exists' }); }

      var startPop = {
        current: 0,
        grade7: 0,
        grade8: 0,
        students: []
      };

      var newElective = new Elective({
        name:         req.body.name,
        description:  req.body.description,
        images:       req.body.images,
        semester:     req.body.semester,
        grades:       req.body.grades,
        cap:          req.body.cap,
        quarters: {
          available:     req.body.quarters.available,
          q:             [startPop, startPop, startPop, startPop]
        }
      });

      newElective.save(function(err) {
        if (err) { res.send(err); }
        console.log('New elective');
        res.json(newElective);
      });
    });

  },

  getAll: function(req, res) {
    Elective.find(function(err, electives) {
      if (err) { res.send(err); }
      res.json(electives);
    });
  },

  update: function(req, res) {
    Elective.findById(req.params.elective_id, function(err, elective) {
      if (err) { res.send(err); }
      if (!elective) { res.json({ message: 'Elective ' + req.body.name + ' does not exist.' }); }

      elective.name               = req.body.name;
      elective.description        = req.body.description;
      elective.images             = req.body.images;
      elective.semester           = req.body.semester;
      elective.grades             = req.body.grades;
      elective.cap                = req.body.cap;
      elective.quarters.available = req.body.quarters.available;

      elective.save(function(err) {
        if (err) { res.send(err); }
        res.json(elective);
      });
    });
  },

  delete: function(req, res) {
    Elective.remove({
      _id: req.params.elective_id
    }, function(err, elective) {
      if (err) { res.send(err); }
      res.json(elective);
    });
  }

};

module.exports = electives;
