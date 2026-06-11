import type { CourseCategory } from '../types/course';

export function getCourseCategoryLabel(category: CourseCategory | string): string {
  switch (category) {
    case 'required':
      return '必修';
    case 'core_elective':
      return '群修';
    case 'general':
      return '通識';
    case 'free_elective':
      return '選修';
    case 'other':
      return '其他';
    default:
      return category;
  }
}
