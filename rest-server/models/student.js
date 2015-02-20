var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;

var StudentSchema = new Schema({
  _user: { type: Schema.Types.ObjectId, ref: 'User' },
  name: {
    first: String,
    last: String
  },
  authPassword: String,
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
