var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;

var StudentSchema = new Schema({
  name: {
    first: String,
    last: String
  },
  pass: {
    student: String,
    parent: String
  },
  username: String,
  grade: Number,
  required: [String], //required electives taken
  submit: Date,
  list: {
    q1: [String], //ids
    q2: [String], //ids
    q3: [String], //ids
    q4: [String], //ids
  },
  electives: [String] //ids
});

module.exports = mongoose.model('Student', StudentSchema);
