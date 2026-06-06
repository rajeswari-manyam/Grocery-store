import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import ProductCard from '../components/ProductCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { categories } from '../data/products';
import { useProducts } from '../context/ProductContext';
import { useDebounce } from '../hooks/useDebounce';
import { stagger } from '../hooks/useScrollReveal';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cartOpen, setCartOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const { products, loading: productsLoading } = useProducts();
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (selectedCategory !== 'all') params.category = selectedCategory;
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, selectedCategory, setSearchParams]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'discount':
        result.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
    }

    return result;
  }, [debouncedSearch, selectedCategory, sortBy]);

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar onCartOpen={() => setCartOpen(true)} />
        <div className="pt-[72px]">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="h-8 bg-slate-100 rounded w-48 mb-6 animate-pulse" />
            <LoadingSkeleton count={8} />
          </div>
        </div>
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <div className="pt-[72px]">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {selectedCategory !== 'all'
                  ? categories.find(c => c.id === selectedCategory)?.name || 'Products'
                  : 'All Products'}
              </h1>
              <p className="text-sm text-slate-400 mt-1">{filtered.length} products found</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-64">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white"
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer"
                  >
                    <X size={14} className="text-slate-400" />
                  </button>
                )}
              </div>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all cursor-pointer"
              >
                <option value="default">Sort: Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
                <option value="discount">Biggest Discount</option>
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all bg-transparent cursor-pointer"
              >
                <Filter size={18} />
              </button>
            </div>
          </div>

          <div className="flex gap-6">
            <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-48 flex-shrink-0`}>
              <div className="md:sticky md:top-24 space-y-1">
                <button
                  onClick={() => { setSelectedCategory('all'); setShowFilters(false); }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-transparent border-none cursor-pointer ${
                    selectedCategory === 'all' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setShowFilters(false); }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 bg-transparent border-none cursor-pointer ${
                      selectedCategory === cat.id ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.name}</span>
                  </button>
                ))}
              </div>
            </aside>

            <div className="flex-1">
              {filtered.length === 0 ? (
                <EmptyState
                  title={debouncedSearch ? `No results for "${debouncedSearch}"` : 'No products found'}
                  subtitle="Try adjusting your search or filter to find what you're looking for."
                  action={{ label: 'Clear Filters', onClick: () => { setSearchInput(''); setSelectedCategory('all'); setSortBy('default'); } }}
                />
              ) : (
                <motion.div
                  variants={stagger(0.06)}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                >
                  {filtered.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
