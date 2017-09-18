const Elective = require('../models/elective');

const electivesREST = {

  create: (req, res) => {
    Elective.findOne({ name: req.body.name }, (err, elective) => {
      if (err) res.send(err);
      if (elective) return res.json({ message: 'An elective by that name aready exists' });

      const startPop = {
        current: [0, 0, 0],
        students: [],
      };

      const newElective = new Elective({
        name: req.body.name,
        description: req.body.description,
        images: req.body.images,
        semester: req.body.semester,
        grades: req.body.grades,
        required: req.body.required,
        cap: req.body.cap,
        available: req.body.available,
        quartersdata: [startPop, startPop, startPop, startPop],
      });

      return newElective.save((err2) => {
        if (err2) { res.send(err2); }
        res.json(newElective);
      });
    });
  },

  getAll: (req, res) => {
    Elective.find((err, electives) => {
      if (err) { res.send(err); }
      return res.json(electives);
    });
  },

  update: (req, res) => {
    Elective.findById(req.params.elective_id, (err, elective) => {
      if (err) { res.send(err); }
      if (!elective) { res.json({ message: `Elective ${req.body.name} does not exist.` }); }

      const elec = elective;
      elec.name = req.body.name;
      elec.description = req.body.description;
      elec.images = req.body.images;
      elec.semester = req.body.semester;
      elec.grades = req.body.grades;
      elec.required = req.body.required;
      elec.cap = req.body.cap;
      elec.available = req.body.available;

      elective.save((err2) => {
        if (err2) { res.send(err2); }
        res.json(elective);
      });
    });
  },

  delete: (req, res) => {
    Elective.remove({
      _id: req.params.elective_id,
    }, (err, elective) => {
      if (err) { res.send(err); }
      res.json(elective);
    });
  },

};

module.exports = electivesREST;
