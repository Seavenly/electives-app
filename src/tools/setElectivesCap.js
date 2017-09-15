const Elective = require('../models/elective');

module.exports = (req, res) => {
  Elective.find().exec().then((electives) => {
    electives.forEach((elective) => {
      const elec = elective;
      elec.cap = +req.params.param;
      elec.save((err) => {
        if (err) { res.send(err); }
      });
    });
    res.json({ message: `Setting cap to ${req.params.param}` });
  });
};
