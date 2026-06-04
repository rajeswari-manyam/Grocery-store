import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { type Product } from '../data/products';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import { useNavigate } from 'react-router-dom';
import { fadeUp } from '../hooks/useScrollReveal';
import ProductImage from './ui/ProductImage';

interface ProductCardProps {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const { items, addItem, updateQuantity } = useCart();
  const navigate = useNavigate();
  const cartItem = items.find(i => i.product.id === product.id);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      custom={index}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 group"
    >
      <div
        className="relative aspect-square flex items-center justify-center cursor-pointer overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${product.category === 'millets' ? '#fef3c7' : product.category === 'rice' ? '#fefce8' : product.category === 'flours' ? '#faf5ff' : product.category === 'pulses' ? '#f0fdf4' : product.category === 'seeds' ? '#fff7ed' : '#fef3c7'}, white)` }}
        onClick={() => navigate(`/products/${product.id}`)}
      >
        <ProductImage image={product.image} name={product.name} className="transition-transform duration-300 group-hover:scale-110" textSize="text-6xl" />
        {product.isFlashSale && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            -{product.discount}%
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-sm font-semibold text-slate-400">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-1">{product.category.replace('-', ' & ')}</p>
        <h3
          className="font-semibold text-slate-800 text-sm mb-0.5 truncate cursor-pointer hover:text-emerald-700 transition-colors"
          onClick={() => navigate(`/products/${product.id}`)}
        >
          {product.name}
        </h3>
        <p className="text-xs text-slate-400 mb-2">{product.unit}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-slate-900 text-base">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-slate-400 line-through ml-1.5">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          {product.inStock && !cartItem && (
            <button
              onClick={() => addItem(product)}
              className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm border-none cursor-pointer"
            >
              <Plus size={16} />
            </button>
          )}
          {cartItem && (
            <div className="flex items-center gap-1 bg-emerald-50 rounded-full p-0.5">
              <button
                onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-emerald-700 hover:bg-emerald-100 transition-colors bg-transparent border-none cursor-pointer"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center text-sm font-bold text-emerald-800">{cartItem.quantity}</span>
              <button
                onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-emerald-700 hover:bg-emerald-100 transition-colors bg-transparent border-none cursor-pointer"
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
