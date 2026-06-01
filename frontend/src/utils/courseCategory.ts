import type { CourseCategory } from '../types/course';

const courseCategoryLabels: Record<CourseCategory, string> = {
  required: 'Required',
  core_elective: 'Core elective',
  general: 'General education',
  free_elective: 'Free elective',
  other: 'Other',
};

export function getCourseCategoryLabel(category: CourseCategory): string {
  return courseCategoryLabels[category];
}
