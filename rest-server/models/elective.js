var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;

var ElectiveSchema = new Schema({
  name:         String,
  description:  String,
  semester:     Boolean,
  required:     Boolean,
  cap:          Number,
  images:       [String],
  grades:       [Number],
  available:    [Number], // quarters
  quartersdata: [{
    current:      [Number], // [grade 6, grade 7, grade 8]
    students:     [String]  // ids
  }]
});

module.exports = mongoose.model('Elective', ElectiveSchema);
