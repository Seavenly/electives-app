var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;

var UserSchema = new Schema({
  name: {
    first: String,
    last: String
  },
  username: String,
  password: String,
  access: String,
  data: { type: Schema.Types.ObjectId, ref: 'Student' }
});

module.exports = mongoose.model('User', UserSchema);
