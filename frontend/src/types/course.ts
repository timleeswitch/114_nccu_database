export type CourseCategory =
  | 'required'
  | 'elective'
  | 'external'
  | 'pe'
  | 'general';

export interface Course {
  course_id: number;
  course_code: string;
  name: string;
  credits: number;
  category: CourseCategory;
  sub_category?: string;
}
