import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ProfileProvider } from './context/ProfileContext';
import { ProductProvider } from './context/ProductContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import ScrollToTop from './components/ScrollToTop';
import WhatsAppButton from './components/WhatsAppButton';
import LocationPrompt from './components/LocationPrompt';
import LoginPrompt from './components/LoginPrompt';
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
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  return (
    <>
      <ScrollToTop />
      <LocationPrompt />
      <WhatsAppButton />
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
        <div
          onClick={() => setShowLoginPrompt(true)}
          className={`fixed inset-0 z-40 cursor-default ${showLoginPrompt ? 'pointer-events-none' : ''}`}
          style={{ backgroundColor: 'transparent' }}
        />
      )}

      <LoginPrompt open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
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
