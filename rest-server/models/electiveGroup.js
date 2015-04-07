'use strict';

var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;

var ElectiveGroupSchema = new Schema({
  name:         String,
  description:  String,
  perYear:      Number,
  electives:    [{ type: Schema.Types.ObjectId, ref: 'Elective' }]
});

module.exports = mongoose.model('ElectiveGroup', ElectiveGroupSchema);
