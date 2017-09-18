const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ElectiveGroupSchema = new Schema({
  name: String,
  description: String,
  limit: Number,
  electives: [{ type: Schema.Types.ObjectId, ref: 'Elective' }],
});

module.exports = mongoose.model('ElectiveGroup', ElectiveGroupSchema);
