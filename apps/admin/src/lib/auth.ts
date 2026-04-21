'use client';

export function saveAuth(token: string, restaurantId: string) {
  localStorage.setItem('token', token);
  localStorage.setItem('restaurantId', restaurantId);
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('restaurantId');
}

export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
}
