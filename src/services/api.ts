import { type Product } from '../data/products';
import { SITE_CONFIG } from '../config';

const API_BASE = `${SITE_CONFIG.backendUrl}/api`;
const STORAGE_KEY = 'manyam-products';

type ProductInput = Omit<Product, 'id'>;

interface AddressInput {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  pincode: string;
  isDefault?: boolean;
}

async function apiRequest<T>(
  path: string,
  options?: RequestInit
): Promise<{ ok: boolean; data: T; status: number }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await res.json();
    return { ok: res.ok, data, status: res.status };
  } catch {
    return { ok: false, data: null as T, status: 0 };
  }
}

function readStorage(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data as Product[];
  } catch {
    return [];
  }
}

function writeStorage(products: Product[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function getToken(): string | null {
  try {
    return localStorage.getItem('manyam-user-auth')
      ? `Bearer ${JSON.parse(localStorage.getItem('manyam-user-auth') || '{}').phone}`
      : null;
  } catch {
    return null;
  }
}

export async function fetchProducts(): Promise<Product[]> {
  const { ok, data } = await apiRequest<Product[]>('/products');
  if (ok && Array.isArray(data)) return data;
  return readStorage();
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { ok, data } = await apiRequest<Product>(`/products/${id}`);
  if (ok && data) return data;
  const products = readStorage();
  return products.find(p => p.id === id) || null;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const token = getToken();
  const { ok, data } = await apiRequest<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: token } : {}) },
  });
  if (ok && data) return data;
  const products = readStorage();
  const id = `p${Date.now()}`;
  const product: Product = { ...input, id };
  products.push(product);
  writeStorage(products);
  return product;
}

export async function updateProduct(id: string, input: Partial<Product>): Promise<Product> {
  const token = getToken();
  const { ok, data } = await apiRequest<Product>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: token } : {}) },
  });
  if (ok && data) return data;
  const products = readStorage();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Product not found');
  products[index] = { ...products[index], ...input };
  writeStorage(products);
  return products[index];
}

export async function deleteProduct(id: string): Promise<void> {
  const token = getToken();
  const { ok } = await apiRequest<{}>(`/products/${id}`, {
    method: 'DELETE',
    headers: { ...(token ? { Authorization: token } : {}) },
  });
  if (ok) return;
  let products = readStorage();
  products = products.filter(p => p.id !== id);
  writeStorage(products);
}

export async function fetchOrders(phone?: string): Promise<any[]> {
  const token = getToken();
  const query = phone ? `?phone=${encodeURIComponent(phone)}` : '';
  const { ok, data } = await apiRequest<any[]>(`/orders${query}`, {
    headers: { ...(token ? { Authorization: token } : {}) },
  });
  if (ok && Array.isArray(data)) return data;
  try {
    const all = JSON.parse(localStorage.getItem('manyam-orders') || '[]');
    if (phone) return all.filter((o: any) => o.phone === phone);
    return all;
  } catch {
    return [];
  }
}

export async function fetchOrderById(id: string): Promise<any | null> {
  const { ok, data } = await apiRequest<any>(`/orders/${id}`);
  if (ok && data) return data;
  try {
    const orders = JSON.parse(localStorage.getItem('manyam-orders') || '[]');
    return orders.find((o: any) => o.id === id) || null;
  } catch {
    return null;
  }
}

export async function createOrder(orderData: {
  items: any[];
  total: number;
  payment: string;
  address: any;
}): Promise<any> {
  const { ok, data } = await apiRequest<any>('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
  if (ok && data) return data;
  const id = `ORD-${Date.now()}`;
  const phone = orderData.address?.phone || '';
  const order = { id, date: new Date().toISOString(), phone, ...orderData, status: 'Confirmed' };
  const orders = JSON.parse(localStorage.getItem('manyam-orders') || '[]');
  orders.push(order);
  localStorage.setItem('manyam-orders', JSON.stringify(orders));
  return order;
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  const token = getToken();
  const { ok } = await apiRequest<{}>(`/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: token } : {}) },
  });
  if (ok) return;
  const orders = JSON.parse(localStorage.getItem('manyam-orders') || '[]');
  const index = orders.findIndex((o: any) => o.id === orderId);
  if (index !== -1) {
    orders[index].status = status;
    localStorage.setItem('manyam-orders', JSON.stringify(orders));
  }
}

export { getToken };

export interface ProfileData {
  id: string;
  phone: string;
  name: string;
  email: string;
  role: string;
  addresses: {
    id: string;
    label: string;
    name: string;
    phone: string;
    line1: string;
    line2: string;
    city: string;
    pincode: string;
    isDefault: boolean;
  }[];
}

export async function fetchProfile(): Promise<ProfileData | null> {
  const token = getToken();
  if (!token) return null;
  const { ok, data } = await apiRequest<ProfileData>('/profile', {
    headers: { Authorization: token },
  });
  if (ok && data) return data;
  return null;
}

export async function updateProfileApi(updates: { name?: string; email?: string }): Promise<ProfileData | null> {
  const token = getToken();
  if (!token) return null;
  const { ok, data } = await apiRequest<ProfileData>('/profile', {
    method: 'PUT',
    body: JSON.stringify(updates),
    headers: { 'Content-Type': 'application/json', Authorization: token },
  });
  if (ok && data) return data;
  return null;
}

export async function addAddressApi(address: Omit<AddressInput, 'id'>): Promise<any> {
  const token = getToken();
  if (!token) return null;
  const { ok, data } = await apiRequest<any>('/profile/addresses', {
    method: 'POST',
    body: JSON.stringify(address),
    headers: { 'Content-Type': 'application/json', Authorization: token },
  });
  if (ok && data) return data;
  return null;
}

export async function updateAddressApi(id: string, updates: Partial<AddressInput>): Promise<any> {
  const token = getToken();
  if (!token) return null;
  const { ok, data } = await apiRequest<any>(`/profile/addresses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
    headers: { 'Content-Type': 'application/json', Authorization: token },
  });
  if (ok && data) return data;
  return null;
}

export async function deleteAddressApi(id: string): Promise<boolean> {
  const token = getToken();
  if (!token) return false;
  const { ok } = await apiRequest<{}>(`/profile/addresses/${id}`, {
    method: 'DELETE',
    headers: { Authorization: token },
  });
  return ok;
}

export async function loginUser(phone: string, password: string): Promise<{ user: any; token: string } | null> {
  const { ok, data } = await apiRequest<any>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });
  if (ok && data) return data;
  return null;
}

export async function registerUser(phone: string, password: string, name?: string): Promise<{ user: any; token: string } | null> {
  const { ok, data } = await apiRequest<any>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ phone, password, name: name || '' }),
  });
  if (ok && data) return data;
  return null;
}

export function getProductImageSrc(image: string): string {
  if (!image) return '';
  if (image.startsWith('http') || image.startsWith('data:')) return image;
  return '';
}

export function isEmojiImage(image: string): boolean {
  if (!image) return true;
  return !image.startsWith('http') && !image.startsWith('data:');
}
