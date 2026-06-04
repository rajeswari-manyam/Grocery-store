import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import EmptyState from '../components/EmptyState';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import { useState } from 'react';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  const deliveryCharge = totalPrice >= 199 ? 0 : 29;
  const grandTotal = totalPrice + deliveryCharge;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar onCartOpen={() => setCartOpen(true)} />
        <div className="pt-[72px]">
          <div className="max-w-4xl mx-auto px-8 py-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Your Cart</h1>
            <EmptyState
              title="Your cart is empty"
              subtitle="Looks like you haven't added anything yet. Browse our products and start shopping!"
              action={{ label: 'Start Shopping', onClick: () => navigate('/products') }}
            />
          </div>
        </div>
        <Footer />
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <div className="pt-[72px]">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Your Cart ({totalItems} items)</h1>
            <button
              onClick={clearCart}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 transition-colors bg-transparent border-none cursor-pointer"
            >
              <Trash2 size={14} />
              Clear Cart
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-3">
              {items.map((item, i) => (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${item.product.category === 'millets' ? '#fef3c7' : item.product.category === 'rice' ? '#fefce8' : '#faf5ff'}, white)` }}
                  >
                    {item.product.image}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800">{item.product.name}</p>
                    <p className="text-xs text-slate-400">{item.product.unit}</p>
                    <p className="text-sm font-bold text-emerald-700 mt-0.5">
                      {formatPrice(item.product.price)} <span className="font-normal text-slate-400">each</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-emerald-400 hover:text-emerald-600 transition-all bg-transparent cursor-pointer"
                    >
                      {item.quantity === 1 ? <Trash2 size={13} /> : <Minus size={13} />}
                    </button>
                    <span className="w-8 text-center font-semibold text-slate-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-emerald-400 hover:text-emerald-600 transition-all bg-transparent cursor-pointer"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="font-bold text-slate-900">{formatPrice(item.product.price * item.quantity)}</p>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors bg-transparent border-none cursor-pointer mt-0.5"
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-24">
                <h2 className="font-bold text-slate-900 text-lg mb-4">Order Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-semibold text-slate-800">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Delivery</span>
                    {deliveryCharge === 0 ? (
                      <span className="text-emerald-600 font-medium">FREE</span>
                    ) : (
                      <span className="font-semibold text-slate-800">{formatPrice(deliveryCharge)}</span>
                    )}
                  </div>
                  {totalPrice < 199 && (
                    <p className="text-xs text-slate-400">
                      Add {formatPrice(199 - totalPrice)} more for free delivery
                    </p>
                  )}
                  <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>{formatPrice(grandTotal)}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full mt-6 py-3.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5 border-none cursor-pointer"
                >
                  Proceed to Checkout
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
