'use strict';

var router    = require('express').Router();
var students  = require('./students');
var electives = require('./electives');
var admins    = require('./admins');


//  STUDENTS
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
    students.delete(req, res);
  });


//  ELECTIVES
router.route('/electives')
  .post(function(req, res) {
    electives.create(req, res);
  })
  .get(function(req, res) {
    electives.getAll(req, res);
  });

router.route('/electives/:elective_id')
  .put(function(req, res) {
    electives.update(req, res);
  })
  .delete(function(req, res) {
    electives.delete(req, res);
  });

//  ADMINS
router.route('/admins')
  .post(function(req, res) {
    admins.create(req, res);
  })
  .get(function(req, res) {
    admins.getAll(req, res);
  });

router.route('/admins/:user_id')
  .put(function(req, res) {
    admins.update(req, res);
  })
  .delete(function(req, res) {
    admins.delete(req, res);
  });

module.exports = router;
