import { mockStudents } from '../mocks/mockStudents';
import type { Student } from '../types/student';

export async function getStudent(studentId: number): Promise<Student | undefined> {
  return Promise.resolve(mockStudents.find((student) => student.student_id === studentId));
}
