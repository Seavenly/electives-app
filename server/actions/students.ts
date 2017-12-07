/* eslint no-underscore-dangle: ["error", { "allow": ["_id", "_group", "_user"] }] */

import mongoose from 'mongoose';
import User, { IBasicUserInfo } from '../models/User';
import Student from '../models/Student';
import { generatePassword } from './actions';

/**
 * Create user and student accounts
 * @param {array} studentsArray - Array of student objects
 * @returns {Promise} promise returns Populated Users
 */
async function createAll(studentsArray: IBasicUserInfo[]) {
  const promises = [];
  const users = [];

  studentsArray.forEach(userData => {
    const newUserId = mongoose.Types.ObjectId();
    const newStudentId = mongoose.Types.ObjectId();
    const newUser = new User({
      _id: newUserId,
      name: {
        first: userData.name.first,
        last: userData.name.last,
      },
      username: (userData.name.first[0] + userData.name.last).toLowerCase(),
      password: generatePassword(),
      access: 'student',
      data: newStudentId,
    });
    const newStudent = new Student({
      _id: newStudentId,
      _user: newUserId,
      grade: userData.grade,
      authPassword: generatePassword(3),
    });

    const p1 = newStudent.save();
    const p2 = User.findOne({ username: newUser.username })
      .exec()
      .then(user => {
        if (user) {
          newUser.username = (
            userData.name.first.substr(0, 2) + userData.name.last
          ).toLowerCase();
        }
        return newUser.save();
      })
      .then(saveduser => users.push(saveduser));

    promises.push(p1, p2);
  });
  return Promise.all(promises).then(() =>
    User.populate(users, { path: 'data' }),
  );
}

// User.populate(data[0], { path: 'data' }).then((popUser) => {
//           students.push(popUser);
//         });

// function create() {
//     const newUser = new User({
//       name: {
//         first: req.body.name.first,
//         last: req.body.name.last,
//       },
//       username: (req.body.name.first[0] + req.body.name.last).toLowerCase(),
//       password: generatePassword(),
//       access: 'student',
//     });

//     const newStudent = new Student({
//       name: {
//         first: req.body.name.first,
//         last: req.body.name.last,
//       },
//       grade: req.body.data.grade,
//       authPassword: generatePassword(3, false),
//     });

//     newUser.data = newStudent._id;
//     newStudent._user = newUser._id;

//     User.findOne({ username: newUser.username }, (err, user) => {
//       if (err) return res.send(err);
//       if (user) {
//         newUser.username = (req.body.name.first[0] + req.body.name.first[1] + req.body.name.last)
//           .toLowerCase();
//       }

//       return newUser.save((err2) => {
//         if (err2) { res.send(err2); }
//         newStudent.save((err3) => {
//           if (err3) { res.send(err3); }
//           newUser.populate('data', '-_user -name -submit', (err4, popUser) => {
//             if (err4) { res.send(err4); }
//             return res.json(popUser);
//           });
//         });
//       });
//     });
//   }

// function getAll() {
//   User.find({ access: 'student' })
//     .populate('data', '-_user -name -submit')
//     .exec((err, popStudents) => {
//       if (err) return res.send(err);
//       const arr = [];
//       let count = popStudents.length;

//       return popStudents.forEach((student) => {
//         User.populate(student, { path: 'data.electives', model: 'Elective', select: 'name semester' }, (err2, popstudent) => {
//           for (let i = 0; i < 4; i += 1) {
//             if (!student.data.electives[i]) popstudent.data.electives.splice(i - 1, 0, null);
//           }
//           arr.push(popstudent);
//           count -= 1;
//           if (count === 0) res.json(arr);
//         });
//       });
//     });
// }

// function getOne() {
//   User.findById(req.params.student_id, (err, user) => {
//     if (err) res.send(err);
//     User.populate(user, { path: 'data', select: '-_user -name -submit' }, (err2, user2) => {
//       res.json(user2);
//     });
//   });
// }

// function update() {
//   User.findById(req.params.student_id, (err, user) => {
//     if (err) return res.send(err);
//     return Student.findById(user.data, (err2, student) => {
//       if (err2) { return res.send(err2); }

//       const u = user;
//       const s = student;
//       if (req.body.name && req.body.name.first) u.name.first = req.body.name.first;
//       if (req.body.name && req.body.name.last) u.name.last = req.body.name.last;
//       if (req.body.username) u.username = req.body.username;
//       if (req.body.password) u.password = req.body.password;

//       if (req.body.data) {
//         if (req.body.data.grade) s.grade = req.body.data.grade;
//         if (req.body.data.required) s.required = req.body.data.required;
//         if (req.body.data.authPassword) s.authPassword = req.body.data.authPassword;
//         if (req.body.data.electives) s.electives = req.body.data.electives;

//         if (req.body.data.list) s.list = req.body.data.list;
//         if (req.body.data.submit) s.submit = new Date();
//       }

//       return u.save((err3) => {
//         if (err3) { return res.send(err3); }
//         return s.save((err4) => {
//           if (err4) { return res.send(err4); }
//           let select = '-_user -name -submit';
//           if (req.isAuthenticated() && req.user.access === 'student') {
//             select += ' -authPassword';
//           }
//           return User.populate(u, { path: 'data', select }, (err5, user2) => {
//             res.json(user2);
//           });
//         });
//       });
//     });
//   });
// }

// function remove() {
//   User.findById(req.params.student_id, (err, user) => {
//     if (err) res.send(err);
//     Student.remove({ _id: user.data }, (err2) => {
//       if (err2) { res.send(err2); }
//       User.remove({ _id: req.params.student_id }, (err3) => {
//         if (err3) { res.send(err3); }
//         res.json({ message: `User ${user.username} successfully removed.` });
//       });
//     });
//   });
// }

// module.exports = { createAll, create, getAll, getOne, update, remove };
module.exports = { createAll };
