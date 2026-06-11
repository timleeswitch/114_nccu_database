export interface Enrollment {
  enrollment_id: number;
  student_id: number;
  course_id: string;
  semester: string;
}

export interface EnrollmentRow {
  enrollment_id: number;
  student_id?: number;
  course_id: string;
  semester: string;
  course_code: string;
  course_name: string;
  credits: number;
  category: string;
  sub_category?: string | null;
}
