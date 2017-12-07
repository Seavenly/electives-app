import logger from '../logger';
import Elective, { IElective } from '../../models/Elective';

export default (): Promise<IElective[]> => {
  logger.clear();
  return Elective.find().exec();
};
