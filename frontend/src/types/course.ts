export type CourseCategory = string;

export interface Course {
  course_id: string;
  course_code: string;
  name: string;
  credits: number;
  category: CourseCategory;
  sub_category?: string | null;
}
