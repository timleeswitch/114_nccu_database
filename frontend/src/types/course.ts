export type CourseCategory =
  | 'required'
  | 'core_elective'
  | 'free_elective'
  | 'physical_education'
  | 'general_education'
  | 'core_general';

export interface Course {
  course_id: string;
  course_code: string;
  name: string;
  credits: number;
  category: CourseCategory;
  sub_category?: string | null;
}
