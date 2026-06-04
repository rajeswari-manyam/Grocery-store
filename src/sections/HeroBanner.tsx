import { motion } from 'framer-motion';
import { ArrowRight, Wheat, Truck, Star, Shield, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HeroBanner() {
  const navigate = useNavigate();

  return (
    <section
      className="relative overflow-hidden pt-[72px]"
      style={{ background: 'linear-gradient(160deg, #fefce8 0%, #fef3c7 55%, #ffffff 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #d97706 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.08,
        }}
      />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(254,252,232,0.9), transparent)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-14 pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-72px)]">
          <div className="flex flex-col pb-20">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="inline-flex items-center gap-2 bg-white border border-amber-200 text-amber-800 text-xs font-semibold px-4 py-2 rounded-full mb-8 w-fit shadow-sm uppercase tracking-wider"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block" />
              100% Natural &middot; Farm Fresh Grains
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-amber-900 text-lg mb-3 font-medium"
            >
              Welcome to MANYAM MART
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15, ease: 'easeOut' }}
              className="font-bold leading-[1.05] mb-5"
              style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', color: '#065f46' }}
            >
              Healthy Millets,<br />
              <span className="text-emerald-600">Rice & Daily Staples</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.22 }}
              className="text-2xl font-bold text-slate-800 mb-2"
            >
              Pure. Natural. Traditional.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.27 }}
              className="text-slate-500 text-base mb-2"
            >
              Straight from the farm to your{' '}
              <span className="text-emerald-600 font-semibold">kitchen</span>
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.32 }}
              className="text-slate-500 text-[15px] leading-relaxed max-w-md mt-3 mb-10"
            >
              Discover our handpicked selection of traditional millets, premium rice
              varieties, stone-ground flours, pure pulses, and health-boosting seeds.
              Every grain tells a story of purity and tradition.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.38 }}
              className="flex flex-wrap gap-4 mb-10"
            >
              <button
                onClick={() => navigate('/products')}
                className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-base px-7 py-3.5 rounded-full transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5 border-none cursor-pointer"
              >
                <Wheat size={18} />
                Shop Millets & Grains
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate('/products?category=millets')}
                className="flex items-center gap-2 bg-white border border-amber-200 text-amber-800 font-semibold text-base px-7 py-3.5 rounded-full hover:bg-amber-50 hover:border-amber-300 transition-all shadow-sm cursor-pointer"
              >
                <Sparkles size={16} className="text-amber-500" />
                Explore Millets
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="flex flex-wrap gap-5 text-sm text-slate-400"
            >
              {[
                { icon: Truck, t: 'Farm Fresh Delivery', c: 'text-emerald-500' },
                { icon: Star, t: '4.9/5 Rating', c: 'text-amber-500' },
                { icon: Shield, t: '100% Pure & Natural', c: 'text-emerald-500' },
                { icon: Wheat, t: 'Premium Quality Grains', c: 'text-amber-500' },
              ].map(({ icon: Icon, t, c }) => (
                <div key={t} className="flex items-center gap-1.5">
                  <Icon size={14} className={c} />{t}
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
            className="relative pb-0 self-end hidden lg:block"
          >
            <div className="relative">
              <div className="absolute -inset-6 rounded-3xl pointer-events-none opacity-40"
                style={{ background: 'linear-gradient(135deg, #fde68a, #d9f99d)', filter: 'blur(40px)' }}
              />
              <div className="relative rounded-2xl overflow-hidden border border-amber-100 shadow-2xl shadow-amber-200/40 bg-white">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-100 bg-amber-50/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-3">
                    <div className="bg-white border border-amber-200 rounded-md px-3 py-1 text-xs text-slate-400 max-w-xs">
                      manyamgrains.in/shop
                    </div>
                  </div>
                </div>
                <div className="p-5 bg-gradient-to-br from-amber-50/50 to-white">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-lg font-bold text-amber-800">Fresh Grains Basket 🧺</div>
                      <div className="text-xs text-slate-400">Handpicked for you</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <Wheat size={20} className="text-amber-600" />
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {[
                      { emoji: '🌾', name: 'Premium Basmati Rice', qty: '1 kg', price: '₹220' },
                      { emoji: '🫘', name: 'Toor Dal', qty: '1 kg', price: '₹145' },
                      { emoji: '🌰', name: 'Flax Seeds (Alsi)', qty: '250 g', price: '₹95' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-amber-100">
                        <span className="text-2xl">{item.emoji}</span>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-800">{item.name}</div>
                          <div className="text-xs text-slate-400">{item.qty}</div>
                        </div>
                        <span className="text-sm font-bold text-slate-800">{item.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-emerald-700 rounded-xl p-4 text-white">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Order Total</span>
                      <span className="text-lg font-bold">₹460</span>
                    </div>
                    <div className="text-xs text-emerald-200 mt-1">Free delivery · Fresh from the farm</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
