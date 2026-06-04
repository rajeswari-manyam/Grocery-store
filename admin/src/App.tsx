import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProductProvider } from './context/ProductContext';
import AdminSidebar from './components/AdminSidebar';
import AdminLoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/DashboardPage';
import AdminProductsPage from './pages/ProductsPage';
import AdminOrdersPage from './pages/OrdersPage';
import AdminUsersPage from './pages/UsersPage';

function AdminLayout() {
  const auth = sessionStorage.getItem('admin-auth');
  if (!auth) return <Navigate to="/login" replace />;
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
  return (
    <BrowserRouter>
      <ProductProvider>
        <Routes>
          <Route path="/login" element={<AdminLoginPage />} />
          <Route path="/*" element={<AdminLayout />} />
        </Routes>
      </ProductProvider>
    </BrowserRouter>
  );
}
