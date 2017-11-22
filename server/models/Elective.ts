import mongoose, { Schema, Document, Model } from 'mongoose';
import { IElectiveGroup } from './ElectiveGroup';

export interface IQuartersData {
  current: number[];
  students: mongoose.Types.ObjectId[]; // ids
  names: string[];
}
export interface IElective extends Document {
  _group?: mongoose.Types.ObjectId | IElectiveGroup;
  name: string;
  description: string;
  semester: boolean;
  required: boolean;
  cap: number;
  limit: number;
  images: string[];
  grades: number[];
  available: number[];
  quartersdata: IQuartersData[];
  totalCurrent: (index: number) => number;
}

const QuartersDataSchema: Schema = new Schema({
  current: { type: [Number], default: [0, 0, 0] }, // [grade 6, grade 7, grade 8]
  students: [{ type: Schema.Types.ObjectId, ref: 'Student' }], // ids
  names: [String],
});

const ElectiveSchema: Schema = new Schema({
  _group: { type: Schema.Types.ObjectId, ref: 'ElectiveGroup' },
  name: String,
  description: String,
  semester: Boolean,
  required: Boolean,
  cap: Number,
  limit: Number,
  images: [String],
  grades: [Number],
  available: [Number], // quarters
  quartersdata: { type: [QuartersDataSchema], default: [{}, {}, {}, {}] },
});

ElectiveSchema.methods.totalCurrent = function totalCurrent(
  index: number,
): number {
  return this.quartersdata[index].students.length;
};
export const Elective: Model<IElective> = mongoose.model(
  'Elective',
  ElectiveSchema,
);
export default Elective;
