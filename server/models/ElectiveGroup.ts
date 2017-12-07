import mongoose, { Schema, Document, Model } from 'mongoose';
import { IElective } from './Elective';

export interface IElectiveGroup extends Document {
  /** Name for this grouping of electives */
  name: string;
  /** Description of what the grouped electives have in common */
  description: string;
  /** How many electives from this group can a student have */
  limit: number;
  /** Reference to electives in this group */
  electives: mongoose.Types.ObjectId[];
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
