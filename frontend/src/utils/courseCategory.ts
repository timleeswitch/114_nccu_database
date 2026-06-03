import type { CourseCategory } from '../types/course';

export function getCourseCategoryLabel(category: CourseCategory | string): string {
  switch (category) {
    case 'required':
      return '必修';
    case 'core_elective':
      return '群修';
    case 'free_elective':
      return '選修';
    case 'physical_education':
      return '體育';
    case 'general_education':
      return '一般通識';
    case 'core_general':
      return '核心通識';
    default:
      return category;
  }
}
