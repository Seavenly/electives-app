const Student = require('../models/student');

module.exports = (req, res) => {
  Student.find({ name: { last: req.params.param } }).exec().then((student) => {
    const list = student.list;
    Student.find().exec().then((students) => {
      let count = students.length;
      students.forEach((stu) => {
        const s = stu;
        s.list = list;
        s.submit = new Date();
        s.save((err) => {
          if (err) { res.send(err); }
          count -= 1;
          if (count === 0) res.json({ message: `Copied ${req.params.param}\'s list to every student` });
        });
      });
    });
  });
};
