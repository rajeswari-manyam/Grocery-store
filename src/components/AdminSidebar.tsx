import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, ArrowLeft } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Users', href: '/admin/users', icon: Users },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    sessionStorage.removeItem('admin-auth');
    navigate('/admin/login');
  };

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-700">
        <img src="/logo.jpeg" alt="MANYAM MART" className="w-9 h-9 rounded-xl object-cover" />
        <div>
          <p className="text-sm font-bold tracking-tight">MANYAM MART</p>
          <p className="text-[10px] text-emerald-300 font-medium">Admin Portal</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => (
          <button
            key={href}
            onClick={() => navigate(href)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-transparent border-none cursor-pointer text-left ${
              location.pathname === href
                ? 'bg-emerald-600/20 text-emerald-300'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-slate-700 space-y-1">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft size={18} />
          Back to Store
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all bg-transparent border-none cursor-pointer"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
