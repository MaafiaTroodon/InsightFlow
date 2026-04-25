export const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export const parseResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.message || 'Request failed.');
    error.status = response.status;
    throw error;
  }

  return payload;
};

export const apiFetch = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  return parseResponse(response);
};
