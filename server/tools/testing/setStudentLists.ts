import { ResponseMessage } from '../../routes';
import Student, { IStudent } from '../../models/Student';

export default async (lastName: string): Promise<ResponseMessage> => {
  const foundStudent = await Student.findOne({
    name: { last: lastName },
  }).exec();
  if (foundStudent === null) {
    return {
      error: `Unable to find student with last name ${lastName}`,
    };
  }
  const students: IStudent[] = await Student.find().exec();
  const savedStudents = students.map(stu => {
    stu.list = foundStudent.list;
    stu.submit = new Date();
    return stu.save();
  });

  try {
    Promise.all(savedStudents);
  } catch (err) {
    return { error: err.message };
  }
  return {
    message: `Copied ${lastName}\'s list to every student`,
  };
};
