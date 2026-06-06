import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { categories } from '../data/products';


export default function CategorySection() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const showArrows = categories.length > 6;

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !showArrows) return;
    updateScrollButtons();
    el.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [showArrows, updateScrollButtons]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const itemWidth = el.querySelector('button')?.offsetWidth || 200;
    const gap = 12;
    const scrollAmount = (itemWidth + gap) * 6;
    el.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Shop by Category</h2>
          <p className="text-slate-400 text-sm">Traditional grains and healthy essentials delivered to your doorstep</p>
        </div>
        <div className="relative">
          {showArrows && canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all cursor-pointer"
            >
              <ChevronLeft size={20} className="text-slate-600" />
            </button>
          )}
          <div
            ref={scrollRef}
            className={`${showArrows ? 'flex overflow-x-auto scroll-smooth gap-3 pb-2' : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3'}`}
            style={showArrows ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : undefined}
          >
            {categories.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, ease: 'easeOut', delay: i * 0.06 }}
                onClick={() => navigate(`/products?category=${cat.id}`)}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group bg-transparent ${showArrows ? 'min-w-[calc((100%/6)-theme(gap.3))] flex-shrink-0' : ''}`}
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
          </div>
          {showArrows && canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all cursor-pointer"
            >
              <ChevronRight size={20} className="text-slate-600" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
