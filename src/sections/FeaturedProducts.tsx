import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useScrollReveal, fadeIn } from '../hooks/useScrollReveal';
import { useProducts } from '../context/ProductContext';

export function FlashSaleSection() {
  const navigate = useNavigate();
  const { products } = useProducts();
  const flashProducts = products.filter(p => p.isFlashSale);
  const { ref, controls } = useScrollReveal();

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-8">
        <motion.div
          ref={ref}
          variants={fadeIn}
          animate={controls}
          initial="hidden"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Zap size={20} className="text-red-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Flash Sale</h2>
                <p className="text-sm text-slate-400">Special offers on traditional grains — grab them while stocks last!</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors bg-transparent border-none cursor-pointer"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {flashProducts.slice(0, 5).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function FeaturedProductsSection() {
  const { ref, controls } = useScrollReveal();
  const { products } = useProducts();
  const featured = products.slice(0, 8);

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-8">
        <motion.div
          ref={ref}
          variants={fadeIn}
          animate={controls}
          initial="hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Popular Grains</h2>
              <p className="text-sm text-slate-400">Most ordered millets and staples this week</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
