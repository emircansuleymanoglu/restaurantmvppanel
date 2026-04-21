const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getRestaurantId() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('restaurantId');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    request<{ access_token: string; restaurantId: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getProducts: () => request<Product[]>('/products'),

  createProduct: (data: Omit<Product, 'id'>) =>
    request<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),

  updateProduct: (id: string, data: Partial<Product>) =>
    request<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteProduct: (id: string) =>
    request<void>(`/products/${id}`, { method: 'DELETE' }),

  getLayout: () => request<Layout>('/layout'),

  saveLayout: (layoutJson: object) =>
    request<Layout>('/layout', { method: 'POST', body: JSON.stringify({ layoutJson }) }),
};

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  restaurantId: string;
  isActive: boolean;
}

export interface LayoutItem {
  id: string;
  productId: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Layout {
  id: string;
  restaurantId: string;
  layoutJson: { items: LayoutItem[] };
  updatedAt: string;
}
