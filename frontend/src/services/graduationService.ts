const API_BASE_URL = 'http://127.0.0.1:8000';

export interface GraduationSummaryItem {
  category: string;
  sub_category: string | null;
  required: number;
  completed: number;
  remaining: number;
}

export interface GraduationCheck {
  is_eligible: boolean;
  total_completed: number;
  total_required: number;
  summary: GraduationSummaryItem[];
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getGraduationCheck(): Promise<GraduationCheck> {
  const response = await fetch(`${API_BASE_URL}/graduation/check`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('無法取得畢業學分檢核結果。');
  }

  const data = await response.json();
  return {
    is_eligible: data.is_eligible,
    total_completed: Number(data.total_completed),
    total_required: Number(data.total_required),
    summary: data.summary.map((item: GraduationSummaryItem) => ({
      ...item,
      required: Number(item.required),
      completed: Number(item.completed),
      remaining: Number(item.remaining),
    })),
  };
}
