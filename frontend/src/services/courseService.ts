import { mockCourses } from '../mocks/mockCourses';
import type { Course } from '../types/course';

export async function getSchoolCourses(): Promise<Course[]> {
  return Promise.resolve([...mockCourses]);
}
