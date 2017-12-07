import mongoose, { Schema, Document, Model } from 'mongoose';
import { IElectiveGroup } from './ElectiveGroup';

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

export interface IQuartersData {
  /** Current total for grade [6, 7, 8] */
  current: number[];
  /** Reference to all students assigned */
  students: mongoose.Types.ObjectId[];
  /** Names of all students assigned, for easy access */
  names: string[];
}
export interface IElective extends Document {
  /** Reference to a group the elective is tied to */
  _group?: mongoose.Types.ObjectId | IElectiveGroup;
  /** Name of the elective */
  name: string;
  /** Description of the elective */
  description: string;
  /** Does the elective take up 2 quarter spots */
  semester: boolean;
  /** Is the elective required in order to graduate */
  required: boolean;
  /** Maximum number of students allowed */
  cap: number;
  /** Limit how many times a student can take the elective in a single year */
  limit: number;
  /** Images of the elective */
  images: string[];
  /** Which grades are allowed to participate in the elective */
  grades: number[];
  /** Which quarters is the elective available */
  available: number[];
  /** Data used for calculating the status of an elective */
  quartersdata: IQuartersData[];
  /** Total number of students assigned to elective for specific quarter */
  totalCurrent: (quarter: number) => number;
}

ElectiveSchema.methods.totalCurrent = function totalCurrent(
  quarter: number,
): number {
  return this.quartersdata[quarter - 1].students.length;
};
export const Elective: Model<IElective> = mongoose.model(
  'Elective',
  ElectiveSchema,
);
export default Elective;
