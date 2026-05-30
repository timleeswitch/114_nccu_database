import type { Student } from '../types/student';

export type MockStudent = Student & {
  password: string;
};

export const mockStudents: MockStudent[] = [
  {
    student_id: '1',
    name: '測試學生',
    password: 'password',
    admission_year: 111,
    department: '資訊科學系',
    program: 'bachelor',
    is_delayed: false,
  },
];
