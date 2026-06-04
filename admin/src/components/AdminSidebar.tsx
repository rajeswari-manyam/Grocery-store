import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, ArrowLeft, X } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Orders', href: '/orders', icon: ShoppingBag },
  { label: 'Users', href: '/users', icon: Users },
];

export default function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (href: string) => {
    navigate(href);
    onClose();
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin-auth');
    navigate('/login');
  };

  const sidebar = (
    <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 h-full">
      <div className="flex items-center justify-between gap-3 px-6 h-16 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="MANYAM MART" className="w-9 h-9 rounded-xl object-cover" />
          <div>
            <p className="text-sm font-bold tracking-tight">MANYAM MART</p>
            <p className="text-[10px] text-emerald-300 font-medium">Admin Portal</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 bg-transparent border-none cursor-pointer">
          <X size={18} />
        </button>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => (
          <button
            key={href}
            onClick={() => handleNav(href)}
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
          onClick={() => window.open('https://grocery-store-q4eh.onrender.com', '_blank')}
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

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-full">{sidebar}</div>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <div className="absolute left-0 top-0 h-full shadow-2xl">{sidebar}</div>
        </div>
      )}
    </>
  );
}
