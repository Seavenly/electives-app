import _ from 'lodash';

import { ResponseMessage } from '../../routes';
import Student, { IStudent } from '../../models/Student';
import Elective, { IElective } from '../../models/Elective';

/**
 * Set randomized elective list for student
 */
function assignRandomElectives(
  student: IStudent,
  electivesByQuarter: IElective[][],
) {
  [1, 2, 3, 4].forEach(quarter => {
    student.list[`q${quarter}`] = _.shuffle<IElective>(
      electivesByQuarter[quarter - 1].filter(
        elective => elective.grades.indexOf(student.grade) !== -1,
      ),
    )
      .slice(0, 3)
      .map(elective => elective._id);
  });
}

export default async (): Promise<ResponseMessage> => {
  const electivesP: Promise<IElective[]> = Elective.find().exec();
  const studentsP: Promise<IStudent[]> = Student.find().exec();

  const [electives, students] = await Promise.all([electivesP, studentsP]);

  const electivesByQuarter = [1, 2, 3, 4].map(quarter =>
    electives.filter(elective => elective.available.indexOf(quarter) !== -1),
  );

  const savedStudents = students.map(student => {
    const fakeSubmitDate: Date = new Date();
    const maxDay: number = new Date(
      fakeSubmitDate.getFullYear(),
      fakeSubmitDate.getMonth(),
      0,
    ).getDate();

    assignRandomElectives(student, electivesByQuarter);
    fakeSubmitDate.setDate(Math.ceil(Math.random() * maxDay));
    fakeSubmitDate.setMinutes(Math.floor(Math.random() * 60));
    student.submit = fakeSubmitDate;
    return student.save();
  });

  try {
    await Promise.all(savedStudents);
  } catch (err) {
    return { error: err.message };
  }
  return { message: 'Student elective lists randomly generated' };
};
