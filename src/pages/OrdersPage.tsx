import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, MapPin, CreditCard, ChevronDown, ChevronUp, MessageCircle, Truck, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import EmptyState from '../components/EmptyState';
import { formatPrice } from '../utils/formatPrice';
import ProductImage from '../components/ui/ProductImage';
import { sendTrackingToBusiness } from '../services/whatsappApi';
import { fetchOrders, fetchOrderById } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Order {
  id: string;
  date: string;
  items: { product: { id: string; name: string; image: string; price: number; unit: string }; quantity: number }[];
  total: number;
  payment: string;
  address: { name: string; address: string; city: string };
  status: string;
}

const paymentLabels: Record<string, string> = {
  cod: 'Cash on Delivery',
  upi: 'UPI',
  netbanking: 'Netbanking',
};

const TRACKING_STAGES = [
  { key: 'confirmed', label: 'Order Confirmed', icon: Package },
  { key: 'packed', label: 'Order Packed', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Out for Delivery', icon: Truck },
];

function getTrackingStatus(orderDate: string, _orderId: string) {
  const created = new Date(orderDate).getTime();
  const now = Date.now();
  const hoursSince = (now - created) / (1000 * 60 * 60);

  if (hoursSince < 1) return { stage: 0, eta: '30-45 mins', locations: ['Store', 'Processing Center'] };
  if (hoursSince < 3) return { stage: 1, eta: '1-2 hours', locations: ['Processing Center', 'Dispatch Hub'] };
  if (hoursSince < 8) return { stage: 2, eta: 'Today', locations: ['Dispatch Hub', 'Your City Hub'] };
  return { stage: 3, eta: 'Arriving soon', locations: ['Your City Hub', 'Your Address'] };
}

function generateTrackingTimeline(orderDate: string, orderId: string) {
  const status = getTrackingStatus(orderDate, orderId);
  const base = new Date(orderDate).getTime();
  const stages = TRACKING_STAGES.map((s, i) => {
    const time = new Date(base + i * 45 * 60 * 1000);
    const isReached = i <= status.stage;
    return {
      ...s,
      time: isReached ? time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null,
      location: status.locations[i] || '',
      reached: isReached,
    };
  });
  return { stages, eta: status.eta };
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const tracking = generateTrackingTimeline(order.date, order.id);

  const trackOnWhatsApp = async () => {
    const timelineText = tracking.stages
      .filter(s => s.reached)
      .map(s => `✓ ${s.label}${s.time ? ` at ${s.time}` : ''}`)
      .join('\n');

    const result = await sendTrackingToBusiness(order.id, timelineText);
    if (!result.sent) {
      alert('📨 WhatsApp system is offline. The tracking info has been queued and will be sent automatically when the system is back online.');
    } else {
      alert('✅ Tracking info sent to your WhatsApp!');
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const paymentLabels: Record<string, string> = {
    cod: 'Cash on Delivery',
    upi: 'UPI',
    netbanking: 'Netbanking',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package size={16} className="text-emerald-600" />
              <span className="font-bold text-slate-900">{order.id}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock size={14} />
              {formatDate(order.date)}
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
              {order.status}
            </span>
            <p className="font-bold text-slate-900 mt-1">{formatPrice(order.total)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <MapPin size={12} />
          Delivering to {order.address.name} &middot; {order.address.city}
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CreditCard size={12} />
            {paymentLabels[order.payment] || order.payment}
          </div>
          <span className="text-emerald-600 font-semibold text-xs">ETA: {tracking.eta}</span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {order.items.slice(0, 5).map(item => (
            <div key={item.product.id} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 flex-shrink-0">
              <ProductImage image={item.product.image} name={item.product.name} textSize="text-lg" />
              <div>
                <p className="text-xs font-medium text-slate-700">{item.product.name}</p>
                <p className="text-[10px] text-slate-400">x{item.quantity}</p>
              </div>
            </div>
          ))}
          {order.items.length > 5 && (
            <span className="text-xs text-slate-400 flex-shrink-0">+{order.items.length - 5} more</span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={() => setExpanded(expanded === order.id ? null : order.id)}
            className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors bg-transparent border-none cursor-pointer"
          >
            {expanded === order.id ? 'Hide Details' : 'View Details'}
            {expanded === order.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <button
            onClick={trackOnWhatsApp}
            className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 hover:bg-green-100 font-semibold px-4 py-2 rounded-full transition-all border-none cursor-pointer"
          >
            <MessageCircle size={14} />
            Track via WhatsApp
          </button>
        </div>
      </div>

      {expanded === order.id && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          exit={{ height: 0 }}
          className="border-t border-slate-100"
        >
          <div className="px-5 py-4 bg-slate-50">
            <div className="space-y-2 mb-4">
              {order.items.map(item => (
                <div key={item.product.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <ProductImage image={item.product.image} name={item.product.name} textSize="text-base" />
                    <span className="text-slate-700">{item.product.name}</span>
                    <span className="text-xs text-slate-400">{item.product.unit}</span>
                  </div>
                  <span className="text-slate-700">{item.quantity} x {formatPrice(item.product.price)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 pt-3 space-y-1 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Payment</span>
                <span className="font-medium">{paymentLabels[order.payment] || order.payment}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Live Tracking</h4>
              <div className="relative">
                {tracking.stages.map((stage, i) => (
                  <div key={stage.key} className="flex items-start gap-3 pb-4 relative">
                    {i < tracking.stages.length - 1 && (
                      <div className={`absolute left-[11px] top-6 w-0.5 h-full -z-0 ${
                        stage.reached && tracking.stages[i + 1].reached ? 'bg-emerald-400' : 'bg-slate-200'
                      }`} />
                    )}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      stage.reached ? 'bg-emerald-100' : 'bg-slate-100'
                    }`}>
                      <stage.icon size={12} className={stage.reached ? 'text-emerald-600' : 'text-slate-400'} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className={`text-sm font-medium ${stage.reached ? 'text-slate-800' : 'text-slate-400'}`}>
                        {stage.label}
                      </p>
                      <div className="flex items-center gap-2">
                        {stage.time && (
                          <span className="text-[11px] text-slate-400">{stage.time}</span>
                        )}
                        {stage.location && (
                          <span className="text-[11px] text-slate-400">{stage.location}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-slate-500 bg-white rounded-xl px-4 py-3 border border-slate-200">
                <span className="font-semibold text-slate-700">Estimated Delivery:</span> {tracking.eta}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [singleOrder, setSingleOrder] = useState<Order | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderParam = searchParams.get('order');

  useEffect(() => {
    if (orderParam) {
      fetchOrderById(orderParam).then(order => {
        if (order) setSingleOrder(order);
      });
    } else {
      fetchOrders(user?.phone).then(setOrders);
    }
  }, [user, orderParam]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const trackOnWhatsApp = async (order: Order) => {
    const tracking = generateTrackingTimeline(order.date, order.id);
    const timelineText = tracking.stages
      .filter(s => s.reached)
      .map(s => `✓ ${s.label}${s.time ? ` at ${s.time}` : ''}`)
      .join('\n');

    const result = await sendTrackingToBusiness(order.id, timelineText);
    if (!result.sent) {
      alert('📨 WhatsApp system is offline. The tracking info has been queued and will be sent automatically when the system is back online.');
    } else {
      alert('✅ Tracking info sent to your WhatsApp!');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <div className="pt-[72px]">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="flex items-center gap-4 mb-8">
            {orderParam && (
              <button onClick={() => navigate('/orders')} className="p-2 rounded-xl hover:bg-slate-100 transition-all bg-transparent border-none cursor-pointer">
                <ArrowLeft size={20} className="text-slate-600" />
              </button>
            )}
            <h1 className="text-3xl font-bold text-slate-900">{orderParam ? 'Order Details' : 'My Orders'}</h1>
          </div>

          {singleOrder ? (
            <OrderCard order={singleOrder} />
          ) : orders.length === 0 ? (
            <EmptyState
              title={orderParam ? 'Order not found' : 'No orders yet'}
              subtitle={orderParam ? 'The order you are looking for could not be found.' : 'Place your first order and it will show up here.'}
              action={{ label: 'Start Shopping', onClick: () => navigate('/products') }}
            />
          ) : (
            <div className="space-y-4">
              {orders.map(order => {
                const tracking = generateTrackingTimeline(order.date, order.id);

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Package size={16} className="text-emerald-600" />
                            <span className="font-bold text-slate-900">{order.id}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Clock size={14} />
                            {formatDate(order.date)}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                            {order.status}
                          </span>
                          <p className="font-bold text-slate-900 mt-1">{formatPrice(order.total)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                        <MapPin size={12} />
                        Delivering to {order.address.name} &middot; {order.address.city}
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <CreditCard size={12} />
                          {paymentLabels[order.payment] || order.payment}
                        </div>
                        <span className="text-emerald-600 font-semibold text-xs">ETA: {tracking.eta}</span>
                      </div>

                      <div className="flex items-center gap-3 overflow-x-auto pb-1">
                        {order.items.slice(0, 5).map(item => (
                          <div key={item.product.id} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 flex-shrink-0">
                            <ProductImage image={item.product.image} name={item.product.name} textSize="text-lg" />
                            <div>
                              <p className="text-xs font-medium text-slate-700">{item.product.name}</p>
                              <p className="text-[10px] text-slate-400">x{item.quantity}</p>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 5 && (
                          <span className="text-xs text-slate-400 flex-shrink-0">+{order.items.length - 5} more</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                          className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors bg-transparent border-none cursor-pointer"
                        >
                          {expanded === order.id ? 'Hide Details' : 'View Details'}
                          {expanded === order.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        <button
                          onClick={() => trackOnWhatsApp(order)}
                          className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 hover:bg-green-100 font-semibold px-4 py-2 rounded-full transition-all border-none cursor-pointer"
                        >
                          <MessageCircle size={14} />
                          Track via WhatsApp
                        </button>
                      </div>
                    </div>

                    {expanded === order.id && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="border-t border-slate-100"
                      >
                        <div className="px-5 py-4 bg-slate-50">
                          <div className="space-y-2 mb-4">
                            {order.items.map(item => (
                              <div key={item.product.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <ProductImage image={item.product.image} name={item.product.name} textSize="text-base" />
                                  <span className="text-slate-700">{item.product.name}</span>
                                  <span className="text-xs text-slate-400">{item.product.unit}</span>
                                </div>
                                <span className="text-slate-700">{item.quantity} x {formatPrice(item.product.price)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="border-t border-slate-200 pt-3 space-y-1 text-sm mb-4">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Payment</span>
                              <span className="font-medium">{paymentLabels[order.payment] || order.payment}</span>
                            </div>
                            <div className="flex justify-between font-bold">
                              <span>Total</span>
                              <span>{formatPrice(order.total)}</span>
                            </div>
                          </div>

                          <div className="border-t border-slate-200 pt-4">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Live Tracking</h4>
                            <div className="relative">
                              {tracking.stages.map((stage, i) => (
                                <div key={stage.key} className="flex items-start gap-3 pb-4 relative">
                                  {i < tracking.stages.length - 1 && (
                                    <div className={`absolute left-[11px] top-6 w-0.5 h-full -z-0 ${
                                      stage.reached && tracking.stages[i + 1].reached ? 'bg-emerald-400' : 'bg-slate-200'
                                    }`} />
                                  )}
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                                    stage.reached ? 'bg-emerald-100' : 'bg-slate-100'
                                  }`}>
                                    <stage.icon size={12} className={stage.reached ? 'text-emerald-600' : 'text-slate-400'} />
                                  </div>
                                  <div className="flex-1 min-w-0 pt-0.5">
                                    <p className={`text-sm font-medium ${stage.reached ? 'text-slate-800' : 'text-slate-400'}`}>
                                      {stage.label}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      {stage.time && (
                                        <span className="text-[11px] text-slate-400">{stage.time}</span>
                                      )}
                                      {stage.location && (
                                        <span className="text-[11px] text-slate-400">{stage.location}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 text-xs text-slate-500 bg-white rounded-xl px-4 py-3 border border-slate-200">
                              <span className="font-semibold text-slate-700">Estimated Delivery:</span> {tracking.eta}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
