const API_BASE_URL = 'http://127.0.0.1:8000';

export interface StudentProfile {
  student_id: number;
  name: string;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getCurrentStudent(): Promise<StudentProfile> {
  const response = await fetch(`${API_BASE_URL}/students/me`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('無法取得學生資料。');
  }

  return response.json();
}
