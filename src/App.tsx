import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ProfileProvider } from './context/ProfileContext';
import { ProductProvider } from './context/ProductContext';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import ScrollToTop from './components/ScrollToTop';
import WhatsAppButton from './components/WhatsAppButton';
import LocationPrompt from './components/LocationPrompt';
import { startFlushInterval } from './services/whatsappApi';
import AdminSidebar from './components/AdminSidebar';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/admin/LoginPage';
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminProductsPage from './pages/admin/ProductsPage';
import AdminOrdersPage from './pages/admin/OrdersPage';
import AdminUsersPage from './pages/admin/UsersPage';

function AdminLayout() {
  const auth = sessionStorage.getItem('admin-auth');
  if (!auth) return <Navigate to="/admin/login" replace />;
  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const interval = startFlushInterval();
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <CartProvider>
            <ProductProvider>
              <ProfileProvider>
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
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route path="/admin/*" element={<AdminLayout />} />
                </Routes>
              </ProfileProvider>
            </ProductProvider>
          </CartProvider>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
