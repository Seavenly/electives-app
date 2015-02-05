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
  spanish: Boolean,
  submit: Date,
  list: {
    q1: [String], //["_id"],
    q2: [String], //["_id"],
    q3: [String], //["_id"],
    q4: [String], //["_id"]
  },
  electives: [String] //["_id"]
});

module.exports = mongoose.model('Student', StudentSchema);
