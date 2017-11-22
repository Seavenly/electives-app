import { Request, Response } from 'express';
import Elective, { IElective } from '../models/Elective';

const setElectiveCap = async (req: Request, res: Response): Promise<void> => {
  const electives: IElective[] = await Elective.find().exec();
  const savedElectives: Promise<IElective>[] = [];

  electives.forEach(elective => {
    elective.cap = +req.params.param;
    savedElectives.push(elective.save());
  });

  await Promise.all(savedElectives).catch(err => res.send(err));
  res.json({ message: `Setting cap to ${req.params.param}` });
};

export default setElectiveCap;
