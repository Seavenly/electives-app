/* eslint no-underscore-dangle: ["error", { "allow": ["_id", "_group"] }] */

const ElectiveGroup = require('../models/electiveGroup');
const Elective = require('../models/elective');

const electiveGroups = {

  create: (req, res) => {
    ElectiveGroup.findOne({ name: req.body.name }, (err, group) => {
      if (err) return res.send(err);
      if (group) return res.json({ message: 'An elective group by that name aready exists' });
      return Elective.find({ _id: { $in: req.body.electives } }, (err2, electives) => {
        if (err2) { return res.send(err2); }

        const errElectives = [];
        electives.forEach((elective) => {
          if (elective._group) {
            errElectives.push(elective.name);
          }
        });
        if (errElectives.length > 0) return res.json({ message: `The following electives cannot be in multiple groups: ${errElectives}` });
        const newGroup = new ElectiveGroup({
          name: req.body.name,
          description: req.body.description,
          perYear: req.body.perYear,
          electives: req.body.electives,
        });

        return newGroup.save((err3) => {
          if (err3) res.send(err3);
          res.json(newGroup);
        });
      });
    });
  },

  getAll: (req, res) => {
    ElectiveGroup.find((err, groups) => {
      if (err) return res.send(err);
      return res.json(groups);
    });
  },

  update: (req, res) => {
    ElectiveGroup.findById(req.params.group_id, (err, group) => {
      if (err) return res.send(err);
      if (!group) return res.json({ message: `Elective group ${req.body.name} does not exist.` });

      const g = group;
      if (req.body.name) g.name = req.body.name;
      if (req.body.description) g.description = req.body.description;
      if (req.body.perYear) g.perYear = req.body.perYear;
      if (req.body.electives) g.electives = req.body.electives;

      return group.save((err2) => {
        if (err2) return res.send(err2);
        return res.json(group);
      });
    });
  },

  delete: (req, res) => {
    ElectiveGroup.remove({ _id: req.params.group_id }, (err, group) => {
      if (err) { return res.send(err); }
      return res.json(group);
    });
  },

};

module.exports = electiveGroups;
