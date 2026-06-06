import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, ShoppingBag } from 'lucide-react';
import { CartProvider } from './context/CartContext';
import { ProfileProvider } from './context/ProfileContext';
import { ProductProvider } from './context/ProductContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import ScrollToTop from './components/ScrollToTop';
import WhatsAppButton from './components/WhatsAppButton';
import LocationPrompt from './components/LocationPrompt';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';

function AppContent() {
  const { isLoggedIn } = useAuth();
  const loc = useLocation();
  const isLoginPage = loc.pathname === '/login';

  return (
    <>
      <ScrollToTop />
      <LocationPrompt />
      {!isLoginPage && <WhatsAppButton />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>

      {!isLoggedIn && !isLoginPage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6"
        >
          <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6">
            <ShoppingBag size={36} className="text-emerald-700" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">MANYAM MART</h1>
          <p className="text-sm text-slate-500 mb-8 text-center max-w-xs">
            Log in to explore our products and place orders.
          </p>

          <Link
            to="/login"
            className="w-full max-w-xs py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <LogIn size={16} />
            Login to Continue
          </Link>
        </motion.div>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <CartProvider>
            <ProductProvider>
              <ProfileProvider>
                <AppContent />
              </ProfileProvider>
            </ProductProvider>
          </CartProvider>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
