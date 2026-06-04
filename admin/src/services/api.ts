import { SITE_CONFIG } from '../config';

const API_BASE = `${SITE_CONFIG.backendUrl}/api`;
const STORAGE_KEY = 'manyam-products';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number | null;
  image: string;
  unit: string;
  description: string;
  inStock: boolean;
  isFlashSale: boolean;
  discount: number | null;
}

type ProductInput = Omit<Product, 'id'>;

async function apiRequest<T>(
  path: string,
  options?: RequestInit
): Promise<{ ok: boolean; data: T; status: number }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
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

export async function fetchProducts(): Promise<Product[]> {
  const { ok, data } = await apiRequest<Product[]>('/products');
  if (ok && Array.isArray(data)) return data;
  return readStorage();
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { ok, data } = await apiRequest<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (ok && data) return data;
  throw new Error('Failed to save product to server. Check that the backend is running.');
}

export async function updateProduct(id: string, input: Partial<Product>): Promise<Product> {
  const { ok, data } = await apiRequest<Product>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  if (ok && data) return data;
  throw new Error('Failed to update product on server. Check that the backend is running.');
}

export async function deleteProduct(id: string): Promise<void> {
  const { ok } = await apiRequest<{}>(`/products/${id}`, {
    method: 'DELETE',
  });
  if (ok) return;
  throw new Error('Failed to delete product on server. Check that the backend is running.');
}

export async function fetchOrders(phone?: string): Promise<any[]> {
  const query = phone ? `?phone=${encodeURIComponent(phone)}` : '';
  const { ok, data } = await apiRequest<any[]>(`/orders${query}`);
  if (ok && Array.isArray(data)) return data;
  try {
    const all = JSON.parse(localStorage.getItem('manyam-orders') || '[]');
    if (phone) return all.filter((o: any) => o.phone === phone);
    return all;
  } catch {
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  const { ok } = await apiRequest<{}>(`/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  if (ok) return;
  const orders = JSON.parse(localStorage.getItem('manyam-orders') || '[]');
  const index = orders.findIndex((o: any) => o.id === orderId);
  if (index !== -1) {
    orders[index].status = status;
    localStorage.setItem('manyam-orders', JSON.stringify(orders));
  }
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
