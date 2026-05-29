import { mockStudents } from '../mocks/mockStudents';
import type { Student } from '../types/student';

export interface LoginPayload {
  studentId: string;
  password: string;
}

function toStudent(student: (typeof mockStudents)[number]): Student {
  return {
    student_id: student.student_id,
    name: student.name,
    admission_year: student.admission_year,
    department: student.department,
    program: student.program,
    is_delayed: student.is_delayed,
  };
}

export async function getMockCurrentStudent(): Promise<Student> {
  return Promise.resolve(toStudent(mockStudents[0]));
}

export async function loginStudent(payload: LoginPayload): Promise<Student> {
  const studentId = payload.studentId.trim();
  const password = payload.password.trim();

  if (!studentId) {
    throw new Error('請輸入學號。');
  }

  if (!password) {
    throw new Error('請輸入密碼。');
  }

  const student = mockStudents.find((mockStudent) => mockStudent.student_id === studentId);

  if (!student) {
    throw new Error('找不到此學號，請確認後再登入。');
  }

  if (student.password !== password) {
    throw new Error('密碼錯誤，請重新輸入。');
  }

  return Promise.resolve(toStudent(student));
}

export async function getStudent(studentId: string): Promise<Student | undefined> {
  const student = mockStudents.find((item) => item.student_id === studentId);

  return Promise.resolve(student ? toStudent(student) : undefined);
}
