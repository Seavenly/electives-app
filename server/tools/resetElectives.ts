import mongoose from 'mongoose';
import Elective, { IElective } from '../models/Elective';
import ElectiveGroup from '../models/ElectiveGroup';

// Reset electives using data from these files
import { electivesData, groupsData, IGroupJson } from '../data';

/**
 * Reset electives using the electives JSON file
 */
async function resetElectives(): Promise<IElective[]> {
  const p1: Promise<void> = ElectiveGroup.remove({}).exec();
  const p2: Promise<void> = Elective.remove({}).exec();

  await p1;
  await p2;

  return Elective.insertMany(electivesData);
}

/**
 * Setup elective groups and link electives to their groups
 */
async function setupGroups(electives: IElective[]): Promise<IElective[]> {
  const groupsWithIds: IGroupJson[] = [];
  const electivesWithGroups: Promise<IElective>[] = [];

  groupsData.forEach(group => {
    group._id = mongoose.Types.ObjectId();
    groupsWithIds.push(group);

    group.electives.forEach((electiveName, i) => {
      const elective: IElective | undefined = electives.find(
        elec => elec.name === electiveName,
      );
      if (elective === undefined) {
        throw new Error(`Unable to find elective with name ${electiveName}`);
      }
      group.electives[i] = elective._id;
      elective._group = group._id;
      electivesWithGroups.push(elective.save());
    });
  });

  await ElectiveGroup.insertMany(groupsWithIds);
  return Promise.all(electivesWithGroups);
}

export default async (): Promise<IElective[]> => {
  const electives = await resetElectives();
  return setupGroups(electives);
};
