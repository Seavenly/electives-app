var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;

var ElectiveSchema = new Schema({
  name: String,
  description: String,
  images: [String],
  semester: Boolean,
  grades: [Number],
  required: Boolean,
  cap: Number,
  quarters: {
    available: [Number],
    q: [{
      current: Number,
      grade7: Number,
      grade8: Number,
      students: [String] //ids
    }]
  },
});

module.exports = mongoose.model('Elective', ElectiveSchema);
