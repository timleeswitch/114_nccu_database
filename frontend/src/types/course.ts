export type CourseCategory =
  | 'required'
  | 'core_elective'
  | 'general'
  | 'free_elective'
  | 'other';

export interface Course {
  course_id: number;
  course_code: string;
  name: string;
  credits: number;
  category: CourseCategory;
}
