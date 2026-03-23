const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('access_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await res.json();

    if (!res.ok) {
      return { error: json.error || 'Đã xảy ra lỗi' };
    }

    return { data: json };
  } catch {
    return { error: 'Không thể kết nối đến server' };
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),

  /** Upload files via multipart/form-data (Content-Type is auto-set by browser) */
  upload: async <T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> => {
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        return { error: json.error || 'Đã xảy ra lỗi' };
      }
      return { data: json };
    } catch {
      return { error: 'Không thể kết nối đến server' };
    }
  },
};
