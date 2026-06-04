import type { Course } from '../types/course';

const API_BASE_URL = 'http://127.0.0.1:8000';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getSchoolCourses(): Promise<Course[]> {
  const response = await fetch(`${API_BASE_URL}/courses/`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('無法取得學校課程庫。');
  }

  const courses = await response.json();
  return courses.map((course: Omit<Course, 'course_code'>) => ({
    ...course,
    course_code: course.course_id,
    credits: Number(course.credits),
  }));
}
