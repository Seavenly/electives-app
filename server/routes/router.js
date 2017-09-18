const router = require('express').Router();
const students = require('./students');
const electives = require('./electives');
const electiveGroups = require('./electiveGroups');
const admins = require('./admins');
const actions = require('./actions');


//  STUDENTS
router.route('/students')
  .post((req, res) => students.createAll(req, res))
  .get((req, res) => students.getAll(req, res));

router.route('/student')
  .post((req, res) => students.create(req, res));

router.route('/student/:student_id')
  .get((req, res) => students.getOne(req, res))
  .put((req, res) => students.update(req, res))
  .delete((req, res) => students.delete(req, res));


//  ELECTIVES
router.route('/electives')
  .post((req, res) => electives.create(req, res))
  .get((req, res) => electives.getAll(req, res));

router.route('/electives/:elective_id')
  .put((req, res) => electives.update(req, res))
  .delete((req, res) => electives.delete(req, res));


// ELECTIVE GROUPS
router.route('/groups')
  .post((req, res) => electiveGroups.create(req, res))
  .get((req, res) => electiveGroups.getAll(req, res));

router.route('/groups/:group_id')
  .put((req, res) => electiveGroups.update(req, res))
  .delete((req, res) => electiveGroups.delete(req, res));

//  ADMINS
router.route('/admins')
  .post((req, res) => admins.create(req, res))
  .get((req, res) => admins.getAll(req, res));

router.route('/admins/:user_id')
  .put((req, res) => admins.update(req, res))
  .delete((req, res) => admins.delete(req, res));

// ACTIONS
router.route('/actions/:target/:action/:param?')
  .get((req, res) => actions[req.params.target][req.params.action](req, res));

module.exports = router;
