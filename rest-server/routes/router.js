var router   = require('express').Router();
var students = require('./students');



router.route('/students')
  .post(function(req, res) {
    students.createAll(req, res);
  })
  .get(function(req, res) {
    students.getAll(req, res);
  });

router.route('/student')
  .post(function(req, res) {
    students.createOne(req, res);
  });

router.route('/student/:student_id')
  .get(function(req, res) {
    students.getOne(req, res);
  })
  .put(function(req, res) {
    students.update(req, res);
  })
  .delete(function(req, res) {
    student.delete(req, res);
  });

module.exports = router;
