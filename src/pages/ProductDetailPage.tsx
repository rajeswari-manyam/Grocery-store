import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Minus, Plus, Share2, Shield, Truck, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { formatPrice } from '../utils/formatPrice';
import { SITE_CONFIG } from '../config';
import { useState } from 'react';
import ProductImage from '../components/ui/ProductImage';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);
  const { items, addItem, updateQuantity } = useCart();
  const { products } = useProducts();

  const product = products.find(p => p.id === id);
  const cartItem = items.find(i => i.product.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar onCartOpen={() => setCartOpen(true)} />
        <div className="pt-[72px] flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-lg font-semibold text-slate-600">Product not found</p>
          <button
            onClick={() => navigate('/products')}
            className="mt-4 px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all border-none cursor-pointer"
          >
            Browse Products
          </button>
        </div>
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    );
  }

  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <div className="pt-[72px]">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="aspect-square rounded-xl flex items-center justify-center max-w-md"
              style={{ background: `linear-gradient(135deg, ${product.category === 'millets' ? '#fef3c7' : product.category === 'rice' ? '#fefce8' : '#faf5ff'}, white)` }}
            >
              <ProductImage image={product.image} name={product.name} textSize="text-6xl" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col justify-center"
            >
              {product.isFlashSale && (
                <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-bold px-3 py-1.5 rounded-full mb-3 w-fit">
                  <Zap size={12} />
                  FLASH SALE - {product.discount}% OFF
                </div>
              )}
              <h1 className="text-2xl font-bold text-slate-900 mb-1">{product.name}</h1>
              <p className="text-sm text-slate-400 mb-1">{product.unit}</p>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">{product.description}</p>

              <div className="flex items-end gap-3 mb-4">
                <span className="text-2xl font-bold text-slate-900">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-base text-slate-400 line-through">{formatPrice(product.originalPrice)}</span>
                    <span className="text-xs font-semibold text-red-500">Save {formatPrice(product.originalPrice - product.price)}</span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { icon: Truck, label: 'Free Delivery' },
                  { icon: Shield, label: 'Fresh Guarantee' },
                  { icon: Zap, label: '15 Min Delivery' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg">
                    <Icon size={11} className="text-emerald-600" />
                    {label}
                  </div>
                ))}
                <button
                  onClick={() => {
                    const msg = encodeURIComponent(`*${product.name}* - ${SITE_CONFIG.siteName}\n\n${product.description}\n\nPrice: ${formatPrice(product.price)}${product.originalPrice ? ` (was ${formatPrice(product.originalPrice)})` : ''}\n\nBuy now: ${SITE_CONFIG.siteUrl}/products/${product.id}`);
                    window.open(`https://wa.me/?text=${msg}`, '_blank');
                  }}
                  className="flex items-center gap-1.5 text-[11px] text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-all border-none cursor-pointer"
                >
                  <Share2 size={11} />
                  Share
                </button>
              </div>

              {product.inStock ? (
                <div className="flex items-center gap-4">
                  {!cartItem ? (
                    <button
                      onClick={() => addItem(product)}
                      className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 py-3 rounded-full transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5 border-none cursor-pointer text-sm"
                    >
                      <ShoppingCart size={16} />
                      Add to Cart
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-emerald-50 rounded-full p-0.5">
                      <button
                        onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-emerald-700 hover:bg-emerald-100 transition-colors bg-transparent border-none cursor-pointer"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-7 text-center text-base font-bold text-emerald-800">{cartItem.quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-emerald-700 hover:bg-emerald-100 transition-colors bg-transparent border-none cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  )}
                  <span className="text-sm text-slate-400">In Stock</span>
                </div>
              ) : (
                <div className="text-sm font-semibold text-red-500">Out of Stock</div>
              )}
            </motion.div>
          </div>

          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Related Products</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {related.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
