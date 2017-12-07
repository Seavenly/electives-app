import { ResponseMessage } from '../../routes';
import Elective, { IElective } from '../../models/Elective';

const setElectiveCap = async (cap: number): Promise<ResponseMessage> => {
  const electives: IElective[] = await Elective.find().exec();
  const savedElectives: Promise<IElective>[] = [];

  electives.forEach(elective => {
    elective.cap = cap;
    savedElectives.push(elective.save());
  });

  try {
    await Promise.all(savedElectives);
  } catch (err) {
    return { error: err.message };
  }
  return { message: `Setting cap to ${cap}` };
};

export default setElectiveCap;
