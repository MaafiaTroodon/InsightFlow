import { apiFetch } from './http.js';

export const registerUser = (payload) =>
  apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const loginUser = (payload) =>
  apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const logoutUser = async () => {
  await fetch(`${(import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
};

export const fetchCurrentUser = () => apiFetch('/auth/me');
