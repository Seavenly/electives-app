import mongoose, { Schema, Document, Model } from 'mongoose';

import { IStudent } from './Student';

const UserSchema: Schema = new Schema({
  name: {
    first: String,
    last: String,
  },
  username: String,
  password: String,
  access: String,
  data: { type: Schema.Types.ObjectId, ref: 'Student' },
});

export interface IBasicUserInfo {
  name: {
    first: string;
    last: string;
  };
  grade: string;
}

export interface IUser extends Document {
  /** User's name properties */
  name: {
    /** First name */
    first: string;
    /** Last name */
    last: string;
  };
  /** User's login username */
  username: string;
  /** User's login password */
  password: string;
  /** Access level of the uer */
  access: string;
  /** Link to the related Student Model */
  data: mongoose.Types.ObjectId | IStudent;
  /** Get the full name of the user */
  fullName(this: IUser): string;
}

UserSchema.methods.fullName = function fullName(): string {
  return `${this.name.first} ${this.name.last}`;
} as IUser['fullName'];

const User: Model<IUser> = mongoose.model('User', UserSchema);

export default User;
