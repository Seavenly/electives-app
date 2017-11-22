import mongoose from 'mongoose';
import electivesJson from './.private/electives.json';
import groupsJson from './.private/groups.json';

export interface IElectiveJson {
  _group?: mongoose.Types.ObjectId;
  name: string;
  description: string;
  semester: boolean;
  required: boolean;
  cap: number;
  limit: number;
  images: string[];
  grades: number[];
  available: number[];
}

export interface IGroupJson {
  _id?: mongoose.Types.ObjectId;
  name: string;
  description: string;
  limit: number;
  electives: string[];
}

export const electivesData: IElectiveJson[] = electivesJson;
export const groupsData: IGroupJson[] = groupsJson;
export default {
  electivesData,
  groupsData,
};
