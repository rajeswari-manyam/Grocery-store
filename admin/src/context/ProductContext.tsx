import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import * as api from '../services/api';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number | null;
  image: string;
  images?: string[];
  unit: string;
  description: string;
  inStock: boolean;
  isFlashSale: boolean;
  discount: number | null;
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addProduct: (data: Omit<Product, 'id'>) => Promise<Product>;
  editProduct: (id: string, data: Partial<Product>) => Promise<Product>;
  removeProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | null>(null);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchProducts();
      setProducts(data);
    } catch {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    function onStorage(e: StorageEvent) {
      if (e.key === 'manyam-products') refresh();
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  const addProduct = async (data: Omit<Product, 'id'>) => {
    const product = await api.createProduct(data);
    setProducts(prev => [...prev, product]);
    return product;
  };

  const editProduct = async (id: string, data: Partial<Product>) => {
    const updated = await api.updateProduct(id, data);
    setProducts(prev => prev.map(p => (p.id === id ? updated : p)));
    return updated;
  };

  const removeProduct = async (id: string) => {
    await api.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const getProduct = (id: string) => products.find(p => p.id === id);

  return (
    <ProductContext.Provider value={{ products, loading, error, refresh, addProduct, editProduct, removeProduct, getProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts must be used within ProductProvider');
  return ctx;
}
