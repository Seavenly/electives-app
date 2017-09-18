const Student = require('../models/student');
const Elective = require('../models/elective');
const _ = require('lodash');

/**
 * Set randomized elective list for student
 * @param {object} student - Student model
 * @param {array} electivesByQuarter -
 * @returns {undefined} nothing
 */
function assignRandomElectives(student, electivesByQuarter) {
  const list = student.list;
  Object.keys(list.toObject()).forEach((q) => {
    const index = +q[1] - 1;
    list[q] = _.map(_.take(_.shuffle(_.filter(electivesByQuarter[index],
      elective => elective.grades.indexOf(student.grade) !== -1)), 3), n => n.id);
  });
}

module.exports = (req, res) => {
  Promise.all([Elective.find().exec(), Student.find().exec()]).then((data) => {
    const electives = data[0];
    const electivesByQuarter = [];
    let students = data[1];
    let count = students.length;

    [1, 2, 3, 4].forEach((quarter) => {
      electivesByQuarter.push(_.filter(electives,
        elective => elective.toObject().available.indexOf(quarter) !== -1));
    });

    students = _.shuffle(students);
    students.forEach((student, index) => {
      const fakeDate = new Date();
      const s = student;

      assignRandomElectives(s, electivesByQuarter);
      fakeDate.setDate(fakeDate.getDate() - 1);
      fakeDate.setMinutes(index);
      s.submit = fakeDate;
      s.save((err) => {
        if (err) { res.send(err); }
        count -= 1;
        if (count === 0) {
          res.json({ message: 'Student elective lists randomly generated' });
        }
      });
    });
  });
};
