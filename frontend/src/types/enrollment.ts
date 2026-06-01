import type { CourseCategory } from './course';

export interface Enrollment {
  enrollment_id: number;
  student_id: number;
  course_id: number;
  semester: string;
}

export interface EnrollmentRow extends Enrollment {
  course_code: string;
  course_name: string;
  credits: number;
  category: CourseCategory;
}
