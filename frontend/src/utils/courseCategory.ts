import type { CourseCategory } from '../types/course';

export function getCourseCategoryLabel(category: CourseCategory | string): string {
  switch (category) {
    case 'required':
      return '必修';
    case 'elective':
      return '選修';
    case 'external':
      return '系外';
    case 'pe':
      return '體育';
    case 'general':
      return '通識';
    default:
      return '未知';
  }
}
