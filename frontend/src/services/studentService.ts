import { mockStudents } from '../mocks/mockStudents';
import type { Student } from '../types/student';

export interface LoginPayload {
  studentId: string;
  password: string;
}

export async function getMockCurrentStudent(): Promise<Student> {
  return Promise.resolve(mockStudents[0]);
}

export async function loginStudent(payload: LoginPayload): Promise<Student> {
  const studentId = Number(payload.studentId.trim());

  if (!payload.password.trim()) {
    throw new Error('請輸入密碼。');
  }

  const student = mockStudents.find((mockStudent) => mockStudent.student_id === studentId);

  if (!student) {
    throw new Error('找不到此學號，請確認後再登入。');
  }

  return Promise.resolve(student);
}

export async function getStudent(studentId: number): Promise<Student | undefined> {
  return Promise.resolve(mockStudents.find((student) => student.student_id === studentId));
}
