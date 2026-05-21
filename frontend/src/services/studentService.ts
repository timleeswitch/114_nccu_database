import { mockStudents } from '../mocks/mockStudents';
import type { Student } from '../types/student';

export interface LoginPayload {
  studentId: string;
  password: string;
}

export async function getMockCurrentStudent(): Promise<Student> {
  return Promise.resolve(mockStudents[0]);
}

export async function loginStudent(): Promise<Student> {
  return getMockCurrentStudent();
}

export async function getStudent(studentId: number): Promise<Student | undefined> {
  return Promise.resolve(mockStudents.find((student) => student.student_id === studentId));
}
