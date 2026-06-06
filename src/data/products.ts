export interface Product {
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

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const categories: Category[] = [
  { id: 'millets', name: 'Millets & Healthy Grains', icon: '🌾', color: '#d97706' },
  { id: 'rice', name: 'Rice Varieties', icon: '🍚', color: '#f59e0b' },
  { id: 'flours', name: 'Flours & Powders', icon: '🌾', color: '#a855f7' },
  { id: 'pulses', name: 'Pulses & Lentils', icon: '🫘', color: '#8b5cf6' },
  { id: 'seeds', name: 'Seeds & Health Add-Ons', icon: '🌰', color: '#10b981' },
  { id: 'ready', name: 'Ready Products', icon: '🍜', color: '#f97316' },
  { id: 'grocery-staples', name: 'Grocery & Staples', icon: '🛒', color: '#6b7280' },
  { id: 'spices-oils', name: 'Spices & Oils', icon: '🧂', color: '#ef4444' },
  { id: 'grains-processed', name: 'Grains & Processed Foods', icon: '🌾', color: '#a16207' },
];

export const products: Product[] = [];
