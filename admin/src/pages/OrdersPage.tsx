import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, MapPin, CreditCard, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';
import * as api from '../services/api';
import ProductImage from '../components/ui/ProductImage';

const paymentLabels: Record<string, string> = {
  cod: 'Cash on Delivery', upi: 'UPI', netbanking: 'Netbanking',
};

const statusOptions = ['Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadOrders = async () => {
    const data = await api.fetchOrders();
    setOrders(data);
  };

  useEffect(() => { loadOrders(); }, []);

  const handleStatusChange = async (orderId: string, status: string) => {
    await api.updateOrderStatus(orderId, status);
    loadOrders();
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filtered = orders.filter((o: any) => {
    const matchSearch = !search || o.id.toLowerCase().includes(search.toLowerCase()) || o.address.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Orders</h1>
        <p className="text-sm text-slate-500 mt-1">{orders.length} total orders</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order ID or customer..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all', ...statusOptions].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`text-xs font-semibold px-3 py-2 rounded-full border-2 transition-all cursor-pointer flex-shrink-0 ${statusFilter === s ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'}`}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">{search || statusFilter !== 'all' ? '🔍' : '📋'}</div>
            <p className="text-base font-semibold text-slate-500">No orders found</p>
            <p className="text-sm text-slate-400 mt-1">{search ? 'Try a different search term.' : statusFilter !== 'all' ? `No orders with status "${statusFilter}".` : 'No orders have been placed yet.'}</p>
          </div>
        ) : (
          filtered.map((order: any) => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Package size={16} className="text-emerald-600" />
                      <span className="font-bold text-slate-900">{order.id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock size={14} />{formatDate(order.date)}
                    </div>
                  </div>
                  <div className="text-right">
                    <select value={order.status} onChange={e => handleStatusChange(order.id, e.target.value)}
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border bg-transparent cursor-pointer outline-none ${
                        order.status === 'Confirmed' ? 'text-emerald-700 border-emerald-200 bg-emerald-50' :
                        order.status === 'Processing' ? 'text-blue-700 border-blue-200 bg-blue-50' :
                        order.status === 'Shipped' ? 'text-purple-700 border-purple-200 bg-purple-50' :
                        order.status === 'Delivered' ? 'text-green-700 border-green-200 bg-green-50' :
                        'text-red-600 border-red-200 bg-red-50'
                      }`}>
                      {statusOptions.map((s: string) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <p className="font-bold text-slate-900 mt-1">{formatPrice(order.total)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3"><MapPin size={12} />Delivering to {order.address.name} &middot; {order.address.city}</div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3"><CreditCard size={12} />Payment: {paymentLabels[order.payment] || order.payment}</div>
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {order.items.slice(0, 5).map((item: any) => (
                    <div key={item.product.id} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 flex-shrink-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <ProductImage image={item.product.image} name={item.product.name} className="w-full h-full object-cover" textSize="text-lg" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-700">{item.product.name}</p>
                        <p className="text-[10px] text-slate-400">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 5 && <span className="text-xs text-slate-400 flex-shrink-0">+{order.items.length - 5} more</span>}
                </div>
                <button onClick={() => setExpanded(expanded === order.id ? null : order.id)} className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium mt-3 transition-colors bg-transparent border-none cursor-pointer">
                  {expanded === order.id ? 'Hide Details' : 'View Details'}
                  {expanded === order.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
              <AnimatePresence>
                {expanded === order.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="border-t border-slate-100 px-5 py-4 bg-slate-50">
                    <div className="space-y-2">
                      {order.items.map((item: any) => (
                        <div key={item.product.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                              <ProductImage image={item.product.image} name={item.product.name} className="w-full h-full object-cover" textSize="text-base" />
                            </div>
                            <span className="text-slate-700">{item.product.name}</span>
                            <span className="text-xs text-slate-400">{item.product.unit}</span>
                          </div>
                          <span className="text-slate-700">{item.quantity} x {formatPrice(item.product.price)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">Payment</span><span className="font-medium">{paymentLabels[order.payment] || order.payment}</span></div>
                      <div className="flex justify-between font-bold"><span>Total</span><span>{formatPrice(order.total)}</span></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
