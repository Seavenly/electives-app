import mongoose, { Schema, Document, Model } from 'mongoose';
import { IElective } from './Elective';

export interface IElectiveGroup extends Document {
  name: string;
  description: string;
  limit: number;
  electives: mongoose.Types.ObjectId[] | IElective[];
}

const ElectiveGroupSchema: Schema = new Schema({
  name: String,
  description: String,
  limit: Number,
  electives: [{ type: Schema.Types.ObjectId, ref: 'Elective' }],
});

export const ElectiveGroup: Model<IElectiveGroup> = mongoose.model(
  'ElectiveGroup',
  ElectiveGroupSchema,
);
export default ElectiveGroup;
