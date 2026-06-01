import type { Program } from './graduationRule';

export interface Student {
  student_id: number;
  name: string;
  admission_year: number;
  department: string;
  program: Program;
  is_delayed: boolean;
}
