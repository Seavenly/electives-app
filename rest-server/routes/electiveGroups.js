'use strict';

var ElectiveGroup = require('../models/electiveGroup');
var Elective      = require('../models/elective');

var electiveGroups = {

  create: function(req, res) {
    ElectiveGroup.findOne({ name: req.body.name }, function(err, group) {
      if (err) { return res.send(err); }
      if (group) { return res.json({ message: 'An elective group by that name aready exists' }); }
      Elective.find({ _id: { $in: req.body.electives }}, function(err, electives) {
        if (err) { return res.send(err); }

        var errElectives = [];
        electives.forEach(function(elective) {
          if (!!elective._group) {
            errElectives.push(elective.name);
          }
        });
        if (errElectives.length > 0) { return res.json({ message: 'The following electives cannot be in multiple groups: '+errElectives }); }
        var newGroup = new ElectiveGroup({
          name:         req.body.name,
          description:  req.body.description,
          perYear:      req.body.perYear,
          electives:    req.body.electives
        });

        newGroup.save(function(err) {
          if (err) { res.send(err); }
          res.json(newGroup);
        });
      });

    });
  },

  getAll: function(req, res) {
    ElectiveGroup.find(function(err, groups) {
      if (err) { return res.send(err); }
      res.json(groups);
    });
  },

  update: function(req, res) {
    ElectiveGroup.findById(req.params.group_id, function(err, group) {
      if (err) { return res.send(err); }
      if (!group) { return res.json({ message: 'Elective group ' + req.body.name + ' does not exist.' }); }

      if (req.body.name)        { group.name        = req.body.name; }
      if (req.body.description) { group.description = req.body.description; }
      if (req.body.perYear)     { group.perYear     = req.body.perYear; }
      if (req.body.electives)   { group.electives   = req.body.electives; }

      group.save(function(err) {
        if (err) { return res.send(err); }
        res.json(group);
      });
    });
  },

  delete: function(req, res) {
    ElectiveGroup.remove({ _id: req.params.group_id }, function(err, group) {
      if (err) { return res.send(err); }
      res.json(group);
    });
  }

};

module.exports = electiveGroups;
