import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { categories } from '../data/products';
import { useScrollReveal, stagger, fadeUp } from '../hooks/useScrollReveal';

export default function CategorySection() {
  const navigate = useNavigate();
  const { ref, controls } = useScrollReveal();

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Shop by Category</h2>
          <p className="text-slate-400 text-sm">Traditional grains and healthy essentials delivered to your doorstep</p>
        </div>
        <motion.div
          ref={ref}
          variants={stagger(0.06)}
          animate={controls}
          initial="hidden"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          {categories.map(cat => (
            <motion.button
              key={cat.id}
              variants={fadeUp}
              onClick={() => navigate(`/products?category=${cat.id}`)}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group bg-transparent"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${cat.color}18` }}
              >
                {cat.icon}
              </div>
              <span className="text-xs font-semibold text-slate-700 text-center leading-tight">
                {cat.name}
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
