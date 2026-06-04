import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { ProductProvider } from './context/ProductContext';
import AdminSidebar from './components/AdminSidebar';
import AdminLoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/DashboardPage';
import AdminProductsPage from './pages/ProductsPage';
import AdminOrdersPage from './pages/OrdersPage';
import AdminUsersPage from './pages/UsersPage';

function AdminLayout() {
  const auth = sessionStorage.getItem('admin-auth');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  if (!auth) return <Navigate to="/login" replace />;
  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-y-auto">
        <div className="lg:hidden flex items-center gap-2 px-4 h-12 border-b border-slate-200 bg-white">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 bg-transparent border-none cursor-pointer">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.jpeg" alt="MANYAM MART" className="w-6 h-6 rounded-md object-cover" />
            <span className="text-sm font-bold text-slate-900">MANYAM MART Admin</span>
          </div>
        </div>
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
