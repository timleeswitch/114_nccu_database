import type { EnrollmentRow } from '../types/enrollment';

const API_BASE_URL = 'http://127.0.0.1:8000';

export interface CreateEnrollmentData {
  course_id: string;
  semester: string;
}

export interface UpdateEnrollmentData {
  course_id?: string;
  semester?: string;
}

function getAuthHeaders(includeJson = false): HeadersInit {
  const token = localStorage.getItem('access_token');
  return {
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function getErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json();
    return data.detail ?? fallback;
  } catch {
    return fallback;
  }
}

function normalizeEnrollment(row: Omit<EnrollmentRow, 'course_code'>): EnrollmentRow {
  return {
    ...row,
    course_code: row.course_id,
    credits: Number(row.credits),
  };
}

export async function getStudentEnrollments(_studentId: number): Promise<EnrollmentRow[]> {
  const response = await fetch(`${API_BASE_URL}/enrollments/`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, '無法取得修課紀錄。'));
  }

  const rows = await response.json();
  return rows.map(normalizeEnrollment);
}

export async function createEnrollment(
  _studentId: number,
  data: CreateEnrollmentData,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/enrollments/`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, '無法建立修課紀錄。'));
  }
}

export async function updateEnrollment(
  enrollmentId: number,
  data: UpdateEnrollmentData,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/enrollments/${enrollmentId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(true),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, '無法更新修課紀錄。'));
  }
}

export async function deleteEnrollment(enrollmentId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/enrollments/${enrollmentId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, '無法刪除修課紀錄。'));
  }
}
