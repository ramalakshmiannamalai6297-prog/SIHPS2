const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function api(path, options = {}) {
  const token = localStorage.getItem('sih-token');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login') {
      localStorage.removeItem('sih-token');
      localStorage.removeItem('sih-user');
      window.location.assign('/login');
    }
    throw new Error(payload.error || 'The request failed. Please try again.');
  }
  return payload;
}

export const jsonBody = (value) => JSON.stringify(value);
