import { motion } from 'framer-motion';
import { Package, ShoppingBag, Users, IndianRupee, TrendingUp, AlertCircle } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { formatPrice } from '../utils/formatPrice';
import { useEffect, useState } from 'react';
import * as api from '../services/api';
import ProductImage from '../components/ui/ProductImage';

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: typeof Package; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const { products } = useProducts();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    api.fetchOrders().then(setOrders);
  }, []);

  const totalRevenue = orders.reduce((sum: number, o: any) => sum + o.total, 0);
  const topProducts = [...products].sort((a, b) => {
    const aSold = orders.filter((o: any) => o.items.some((i: any) => i.product.id === a.id)).length;
    const bSold = orders.filter((o: any) => o.items.some((i: any) => i.product.id === b.id)).length;
    return bSold - aSold;
  }).slice(0, 5);

  const recentOrders = [...orders].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of your store</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon={Package} label="Total Products" value={String(products.length)} sub={`${products.filter(p => p.inStock).length} in stock`} color="bg-emerald-600" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={String(orders.length)} color="bg-blue-600" />
        <StatCard icon={IndianRupee} label="Total Revenue" value={formatPrice(totalRevenue)} color="bg-amber-600" />
        <StatCard icon={Users} label="Registered Users" value={String(0)} color="bg-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-600" />
            Top Products
          </h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-slate-400">No sales data yet.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-5">{i + 1}.</span>
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <ProductImage image={p.image} name={p.name} className="w-full h-full object-cover" textSize="text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{formatPrice(p.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-600" />
            Recent Orders
          </h2>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-slate-400">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o: any) => (
                <div key={o.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{o.id}</p>
                    <p className="text-xs text-slate-400">{new Date(o.date).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-700">{formatPrice(o.total)}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      o.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700' :
                      o.status === 'Shipped' ? 'bg-blue-50 text-blue-700' :
                      o.status === 'Delivered' ? 'bg-green-50 text-green-700' :
                      'bg-red-50 text-red-600'
                    }`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
