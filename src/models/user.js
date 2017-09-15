const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    first: String,
    last: String,
  },
  username: String,
  password: String,
  access: String,  // Access level - Student, Admin
  data: { type: Schema.Types.ObjectId, ref: 'Student' },
});

module.exports = mongoose.model('User', UserSchema);

UserSchema.methods.fullName = function fullName() {
  return `${this.name.first} ${this.name.last}`;
};
