'use strict';

var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;


var QuartersDataSchema = new Schema({
  current:      { type: [Number], default: [0,0,0] }, // [grade 6, grade 7, grade 8]
  students:     [{ type: Schema.Types.ObjectId, ref: 'Student' }]  // ids
});
var ElectiveSchema = new Schema({
  _group:         { type: Schema.Types.ObjectId, ref: 'ElectiveGroup' },
  name:         String,
  description:  String,
  semester:     Boolean,
  required:     Boolean,
  cap:          Number,
  perYear:      Number,
  images:       [String],
  grades:       [Number],
  available:    [Number], // quarters
  quartersdata: { type: [QuartersDataSchema], default: [{},{},{},{}] }
});

ElectiveSchema.methods.totalCurrent = function(index) {
  return this.quartersdata[index].students.length;
};

module.exports = mongoose.model('Elective', ElectiveSchema);
