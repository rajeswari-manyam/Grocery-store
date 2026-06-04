import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import { useNavigate } from 'react-router-dom';
import ProductImage from './ui/ProductImage';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, updateQuantity, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  const goToCart = () => {
    onClose();
    navigate('/cart');
  };

  const goToCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-emerald-600" />
                <span className="font-semibold text-slate-900">Your Cart</span>
                <span className="text-sm text-slate-400">({totalItems} items)</span>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors bg-transparent border-none cursor-pointer">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <ShoppingBag size={32} className="text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">Your cart is empty</p>
                  <p className="text-sm text-slate-400 mt-1">Add items to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.product.id} className="flex items-center gap-4 bg-slate-50 rounded-xl p-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-slate-100"
                        style={{ background: `linear-gradient(135deg, ${item.product.category === 'millets' ? '#fef3c7' : item.product.category === 'rice' ? '#fefce8' : '#faf5ff'}, white)` }}
                      >
                        <ProductImage image={item.product.image} name={item.product.name} className="w-full h-full object-cover" textSize="text-2xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{item.product.name}</p>
                        <p className="text-xs text-slate-400">{item.product.unit}</p>
                        <p className="text-sm font-bold text-emerald-700 mt-0.5">{formatPrice(item.product.price * item.quantity)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors bg-transparent cursor-pointer"
                        >
                          {item.quantity === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                        </button>
                        <span className="w-7 text-center text-sm font-semibold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors bg-transparent cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-slate-100 px-6 py-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Delivery</span>
                  <span className="text-emerald-600 font-medium">FREE</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-base pt-2 border-t border-slate-100">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={goToCart}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all bg-transparent cursor-pointer"
                  >
                    View Cart
                  </button>
                  <button
                    onClick={goToCheckout}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-1.5 border-none cursor-pointer"
                  >
                    Checkout <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
