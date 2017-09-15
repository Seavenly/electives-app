/* eslint no-underscore-dangle: ["error", { "allow": ["_id", "_group", "_user"] }] */

const User = require('../models/user');
const Student = require('../models/student');
const generatePassword = require('password-generator');

const studentsREST = {

  createAll: (req, res) => {
    const arr = req.body.students;
    const header = arr.shift();
    const students = [];
    let count = arr.length - 1;

    arr.forEach((line) => {
      if (!line) { return; }

      const newUser = new User({
        name: {
          first: line[header.indexOf('First')],
          last: line[header.indexOf('Last')],
        },
        username: (line[header.indexOf('First')][0] + line[header.indexOf('Last')]).toLowerCase(),
        password: generatePassword(),
        access: 'student',
      });

      const newStudent = new Student({
        name: {
          first: line[header.indexOf('First')],
          last: line[header.indexOf('Last')],
        },
        grade: line[header.indexOf('Grade')],
        authPassword: generatePassword(3, false),
      });

      newUser.data = newStudent._id;
      newStudent._user = newUser._id;

      Student.findOne({ username: newUser.username }, (err, student) => {
        if (err) res.send(err);
        if (student) newUser.username = (line[header.indexOf('First')].substr(0, 2) + line[header.indexOf('Last')]).toLowerCase();

        newUser.save((err2) => {
          if (err2) { res.send(err2); }
          newStudent.save((err3) => {
            if (err3) { res.send(err3); }
            newUser.populate('data', '-_user -name -submit', (err4, popUser) => {
              if (err4) { res.send(err4); }
              count -= 1;
              students.push(popUser);
              if (count === 0) res.json(students);
            });
          });
        });
      });
    });
  },

  create: (req, res) => {
    const newUser = new User({
      name: {
        first: req.body.name.first,
        last: req.body.name.last,
      },
      username: (req.body.name.first[0] + req.body.name.last).toLowerCase(),
      password: generatePassword(),
      access: 'student',
    });

    const newStudent = new Student({
      name: {
        first: req.body.name.first,
        last: req.body.name.last,
      },
      grade: req.body.data.grade,
      authPassword: generatePassword(3, false),
    });

    newUser.data = newStudent._id;
    newStudent._user = newUser._id;

    User.findOne({ username: newUser.username }, (err, user) => {
      if (err) return res.send(err);
      if (user) {
        newUser.username = (req.body.name.first[0] + req.body.name.first[1] + req.body.name.last)
          .toLowerCase();
      }

      return newUser.save((err2) => {
        if (err2) { res.send(err2); }
        newStudent.save((err3) => {
          if (err3) { res.send(err3); }
          newUser.populate('data', '-_user -name -submit', (err4, popUser) => {
            if (err4) { res.send(err4); }
            return res.json(popUser);
          });
        });
      });
    });
  },

  getAll: (req, res) => {
    User.find({ access: 'student' })
        .populate('data', '-_user -name -submit')
        .exec((err, popStudents) => {
          if (err) return res.send(err);
          const arr = [];
          let count = popStudents.length;

          return popStudents.forEach((student) => {
            User.populate(student, { path: 'data.electives', model: 'Elective', select: 'name semester' }, (err2, popstudent) => {
              for (let i = 0; i < 4; i += 1) {
                if (!student.data.electives[i]) popstudent.data.electives.splice(i - 1, 0, null);
              }
              arr.push(popstudent);
              count -= 1;
              if (count === 0) res.json(arr);
            });
          });
        });
  },

  getOne: (req, res) => {
    User.findById(req.params.student_id, (err, user) => {
      if (err) res.send(err);
      User.populate(user, { path: 'data', select: '-_user -name -submit' }, (err2, user2) => {
        res.json(user2);
      });
    });
  },

  update: (req, res) => {
    User.findById(req.params.student_id, (err, user) => {
      if (err) return res.send(err);
      return Student.findById(user.data, (err2, student) => {
        if (err2) { return res.send(err2); }

        const u = user;
        const s = student;
        if (req.body.name && req.body.name.first) u.name.first = req.body.name.first;
        if (req.body.name && req.body.name.last) u.name.last = req.body.name.last;
        if (req.body.username) u.username = req.body.username;
        if (req.body.password) u.password = req.body.password;

        if (req.body.data) {
          if (req.body.data.grade) s.grade = req.body.data.grade;
          if (req.body.data.required) s.required = req.body.data.required;
          if (req.body.data.authPassword) s.authPassword = req.body.data.authPassword;
          if (req.body.data.electives) s.electives = req.body.data.electives;

          if (req.body.data.list) s.list = req.body.data.list;
          if (req.body.data.submit) s.submit = new Date();
        }

        return u.save((err3) => {
          if (err3) { return res.send(err3); }
          return s.save((err4) => {
            if (err4) { return res.send(err4); }
            let select = '-_user -name -submit';
            if (req.isAuthenticated() && req.user.access === 'student') {
              select += ' -authPassword';
            }
            return User.populate(u, { path: 'data', select }, (err5, user2) => {
              res.json(user2);
            });
          });
        });
      });
    });
  },

  delete: (req, res) => {
    User.findById(req.params.student_id, (err, user) => {
      if (err) res.send(err);
      Student.remove({ _id: user.data }, (err2) => {
        if (err2) { res.send(err2); }
        User.remove({ _id: req.params.student_id }, (err3) => {
          if (err3) { res.send(err3); }
          res.json({ message: `User ${user.username} successfully removed.` });
        });
      });
    });
  },
};

module.exports = studentsREST;
