'use strict';

var router          = require('express').Router();
var students        = require('./students');
var electives       = require('./electives');
var electiveGroups  = require('./electiveGroups');
var admins          = require('./admins');
var actions         = require('./actions');


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
    students.create(req, res);
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


// ELECTIVE GROUPS
router.route('/groups')
  .post(function(req, res) {
    electiveGroups.create(req, res);
  })
  .get(function(req, res) {
    electiveGroups.getAll(req, res);
  });

router.route('/groups/:group_id')
  .put(function(req, res) {
    electiveGroups.update(req, res);
  })
  .delete(function(req, res) {
    electiveGroups.delete(req, res);
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

// ACTIONS
router.route('/actions/:target/:action/:param?')
  .get(function(req, res) {
    actions[req.params.target][req.params.action](req, res);
  });

module.exports = router;
