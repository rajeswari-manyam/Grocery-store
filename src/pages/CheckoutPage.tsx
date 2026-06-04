import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, CreditCard, ChevronRight, CheckCircle, Wallet, Building2, DollarSign, Clock, MessageCircle, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import { useCart } from '../context/CartContext';
import { useProfile, type Address } from '../context/ProfileContext';
import { formatPrice } from '../utils/formatPrice';
import { SITE_CONFIG } from '../config';
import ProductImage from '../components/ui/ProductImage';
import { useLocation } from '../context/LocationContext';
import { notifyBusinessOrder, sendOrderConfirmationToCustomer } from '../services/whatsappApi';
import { createOrder } from '../services/api';

type PaymentMethod = 'cod' | 'upi' | 'netbanking';

const labelColors: Record<string, string> = {
  Home: 'bg-emerald-100 text-emerald-700',
  Work: 'bg-blue-100 text-blue-700',
  Other: 'bg-amber-100 text-amber-700',
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { profile, defaultAddress, addAddress } = useProfile();
  const { location: userLocation } = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [waStatus, setWaStatus] = useState<'sending' | 'sent' | 'queued' | null>(null);
  const [notifyMsg, setNotifyMsg] = useState('');
  const [payment, setPayment] = useState<PaymentMethod>('cod');
  const [form, setForm] = useState({
    name: profile.name || '',
    phone: profile.phone || '',
    address: defaultAddress ? `${defaultAddress.line1}${defaultAddress.line2 ? `, ${defaultAddress.line2}` : ''}` : '',
    city: defaultAddress?.city || '',
    pincode: defaultAddress?.pincode || '',
  });
  const [selectedAddrId, setSelectedAddrId] = useState<string | null>(defaultAddress?.id || null);
  const [showNewAddrForm, setShowNewAddrForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: 'Home',
    line1: '',
    line2: '',
    city: '',
    pincode: '',
    saveAddress: false,
  });

  const deliveryCharge = totalPrice >= SITE_CONFIG.freeDeliveryMin ? 0 : SITE_CONFIG.deliveryCharge;
  const total = totalPrice + deliveryCharge;
  const valid = form.name && form.phone && form.address && form.city && form.pincode;

  const loadAddress = (addr: Address) => {
    setForm(f => ({
      ...f,
      address: `${addr.line1}${addr.line2 ? `, ${addr.line2}` : ''}`,
      city: addr.city,
      pincode: addr.pincode,
    }));
    setSelectedAddrId(addr.id);
    setShowNewAddrForm(false);
  };

  const handleUseNewAddress = () => {
    setSelectedAddrId(null);
    setShowNewAddrForm(true);
    setForm(f => ({ ...f, address: '', city: '', pincode: '' }));
  };

  const handleSaveNewAddress = () => {
    if (!newAddr.line1 || !newAddr.city || !newAddr.pincode) return;
    addAddress({
      label: newAddr.label,
      line1: newAddr.line1,
      line2: newAddr.line2,
      city: newAddr.city,
      pincode: newAddr.pincode,
      isDefault: profile.addresses.length === 0,
    });
    setForm(f => ({
      ...f,
      address: `${newAddr.line1}${newAddr.line2 ? `, ${newAddr.line2}` : ''}`,
      city: newAddr.city,
      pincode: newAddr.pincode,
    }));
    setShowNewAddrForm(false);
    setNewAddr({ label: 'Home', line1: '', line2: '', city: '', pincode: '', saveAddress: false });
  };

  const handlePlaceOrder = async () => {
    const order = await createOrder({
      items: [...items],
      total,
      payment,
      address: { ...form },
    });
    const id = order.id;

    setOrderId(id);

    const itemList = items.map(i =>
      `${i.product.name} x${i.quantity} = ${formatPrice(i.product.price * i.quantity)}`
    ).join('\n');

    const paymentLabel = payment === 'cod' ? 'Cash on Delivery' : payment === 'upi' ? `UPI (Pay to ${SITE_CONFIG.upiId})` : 'Netbanking';

    const userLocStr = userLocation ? `${userLocation.city}${userLocation.area ? `, ${userLocation.area}` : ''}` : 'Not shared';

    clearCart();
    setPlaced(true);
    setWaStatus('sending');

    const bizMsg =
      `🛒 *NEW ORDER - ${SITE_CONFIG.siteName}* 🛒\n\n` +
      `Order: ${id}\n` +
      `Date: ${new Date().toLocaleString('en-IN')}\n\n` +
      `*Items:*\n${itemList}\n\n` +
      `*Total: ${formatPrice(total)}*\n` +
      `*Payment: ${paymentLabel}*\n\n` +
      `*Customer:* ${form.name}\n` +
      `*Phone:* ${form.phone}\n` +
      `*Address:* ${form.address}, ${form.city} — ${form.pincode}`;
    setNotifyMsg(bizMsg);

    notifyBusinessOrder({
      id,
      items: itemList,
      total: formatPrice(total),
      payment: paymentLabel,
      customerName: form.name,
      customerPhone: form.phone,
      address: form.address,
      city: form.city,
      pincode: form.pincode,
      location: userLocStr,
    }).then(r => setWaStatus(r.sent ? 'sent' : 'queued'));

    sendOrderConfirmationToCustomer(form.phone, {
      id,
      items: itemList,
      total: formatPrice(total),
      payment: paymentLabel,
      customerName: form.name,
    });
  };

  if (items.length === 0 && !placed) {
    navigate('/cart');
    return null;
  }

  if (placed) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar onCartOpen={() => setCartOpen(true)} />
        <div className="pt-[72px] flex items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Order Placed! 🎉</h1>
            <p className="text-sm text-slate-500 mb-1">Order ID: <span className="font-semibold text-slate-800">{orderId}</span></p>
            <p className="text-slate-500 mb-2">Your order has been confirmed.</p>
            <p className="text-sm text-slate-400 mb-3">We'll confirm your order via WhatsApp shortly!</p>
            <p className="text-xs text-slate-400 mb-3">Payment: <span className="font-medium">{payment === 'cod' ? 'Cash on Delivery' : payment === 'upi' ? `UPI (${SITE_CONFIG.upiId})` : 'Netbanking'}</span></p>
            {waStatus === 'queued' && (
              <div className="mb-8">
                <p className="text-xs text-amber-500 flex items-center justify-center gap-1 mb-3">
                  <Clock size={12} /> Auto-send unavailable — notify business manually
                </p>
                <a
                  href={`https://wa.me/${SITE_CONFIG.businessWhatsApp.replace(/\D/g, '')}?text=${encodeURIComponent(notifyMsg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all"
                >
                  <MessageCircle size={16} />
                  Notify Business on WhatsApp
                </a>
              </div>
            )}
            {waStatus === 'sent' && (
              <p className="text-xs text-emerald-500 mb-8">✅ WhatsApp notification sent to business</p>
            )}
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/orders')} className="px-6 py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition-all border-none cursor-pointer">View Orders</button>
              <button onClick={() => navigate('/')} className="px-6 py-3 rounded-full border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all bg-transparent cursor-pointer">Continue Shopping</button>
            </div>
          </motion.div>
        </div>
        <Footer />
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <div className="pt-[72px]">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={16} className="text-emerald-600" />
                  <h2 className="font-bold text-slate-900">Delivery Address</h2>
                </div>

                {profile.addresses.length > 0 && !showNewAddrForm && (
                  <div className="space-y-2 mb-4">
                    {profile.addresses.map(a => (
                      <button
                        key={a.id}
                        onClick={() => loadAddress(a)}
                        className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all bg-transparent cursor-pointer ${
                          selectedAddrId === a.id
                            ? 'border-emerald-400 bg-emerald-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selectedAddrId === a.id ? 'border-emerald-600' : 'border-slate-300'
                        }`}>
                          {selectedAddrId === a.id && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${labelColors[a.label] || 'bg-slate-100 text-slate-600'}`}>
                              {a.label}
                            </span>
                            {a.isDefault && (
                              <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Default</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-700">{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
                          <p className="text-xs text-slate-400">{a.city} — {a.pincode}</p>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={handleUseNewAddress}
                      className="w-full flex items-center gap-3 p-4 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50 transition-all text-sm font-medium bg-transparent cursor-pointer"
                    >
                      <Plus size={18} />
                      Deliver to a different address
                    </button>
                  </div>
                )}

                {showNewAddrForm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Add New Address</h3>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        {['Home', 'Work', 'Other'].map(label => (
                          <button
                            key={label}
                            onClick={() => setNewAddr(f => ({ ...f, label }))}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all bg-transparent cursor-pointer ${
                              newAddr.label === label
                                ? 'border-emerald-400 bg-emerald-100 text-emerald-700'
                                : 'border-slate-200 text-slate-500 hover:border-slate-300'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <input
                        placeholder="Address Line 1"
                        value={newAddr.line1}
                        onChange={e => setNewAddr(f => ({ ...f, line1: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      />
                      <input
                        placeholder="Address Line 2 (optional)"
                        value={newAddr.line2}
                        onChange={e => setNewAddr(f => ({ ...f, line2: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          placeholder="City"
                          value={newAddr.city}
                          onChange={e => setNewAddr(f => ({ ...f, city: e.target.value }))}
                          className="px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                        />
                        <input
                          placeholder="Pincode"
                          value={newAddr.pincode}
                          onChange={e => setNewAddr(f => ({ ...f, pincode: e.target.value }))}
                          className="px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newAddr.saveAddress}
                          onChange={e => setNewAddr(f => ({ ...f, saveAddress: e.target.checked }))}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        Save this address to my profile
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (!newAddr.line1 || !newAddr.city || !newAddr.pincode) return;
                            setForm(f => ({
                              ...f,
                              address: `${newAddr.line1}${newAddr.line2 ? `, ${newAddr.line2}` : ''}`,
                              city: newAddr.city,
                              pincode: newAddr.pincode,
                            }));
                            if (newAddr.saveAddress) {
                              handleSaveNewAddress();
                            } else {
                              setSelectedAddrId(null);
                              setShowNewAddrForm(false);
                              setNewAddr({ label: 'Home', line1: '', line2: '', city: '', pincode: '', saveAddress: false });
                            }
                          }}
                          disabled={!newAddr.line1 || !newAddr.city || !newAddr.pincode}
                          className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed border-none cursor-pointer"
                        >
                          Use This Address
                        </button>
                        <button
                          onClick={() => { setShowNewAddrForm(false); setNewAddr({ label: 'Home', line1: '', line2: '', city: '', pincode: '', saveAddress: false }); }}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all bg-transparent cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="sm:col-span-2 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
                  <input placeholder="Phone Number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="sm:col-span-2 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
                  <textarea placeholder="Delivery Address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} rows={3} className="sm:col-span-2 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 resize-none" />
                  <input placeholder="City" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
                  <input placeholder="Pincode" value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} className="px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard size={16} className="text-emerald-600" />
                  <h2 className="font-bold text-slate-900">Payment Method</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { id: 'cod' as PaymentMethod, icon: DollarSign, label: 'Cash on Delivery', desc: 'Pay when you receive your order' },
                    { id: 'upi' as PaymentMethod, icon: Wallet, label: 'UPI', desc: `Pay via GPay, PhonePe, Paytm — UPI ID: ${SITE_CONFIG.upiId}` },
                    { id: 'netbanking' as PaymentMethod, icon: Building2, label: 'Netbanking', desc: 'All major banks supported' },
                  ].map(({ id, icon: Icon, label, desc }) => (
                    <button
                      key={id}
                      onClick={() => setPayment(id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left bg-transparent cursor-pointer ${
                        payment === id ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        payment === id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">{label}</p>
                        <p className="text-xs text-slate-400">{desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        payment === id ? 'border-emerald-600' : 'border-slate-300'
                      }`}>
                        {payment === id && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />}
                      </div>
                    </button>
                  ))}
                </div>
                {payment === 'upi' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <p className="text-sm font-semibold text-amber-800 mb-1">Pay via UPI</p>
                    <p className="text-xs text-amber-700 mb-2">Send payment to this UPI ID and your order will be confirmed:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 rounded-lg bg-white border border-amber-200 text-sm font-bold text-amber-900">{SITE_CONFIG.upiId}</code>
                      <button
                        onClick={() => navigator.clipboard.writeText(SITE_CONFIG.upiId)}
                        className="px-3 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold transition-all border-none cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-24">
                <h2 className="font-bold text-slate-900 text-lg mb-4">Order Summary</h2>
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {items.map(item => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <ProductImage image={item.product.image} name={item.product.name} textSize="text-xl" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{item.product.name}</p>
                        <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 text-sm border-t border-slate-100 pt-4">
                  <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-semibold">{formatPrice(totalPrice)}</span></div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Delivery</span>
                    {deliveryCharge === 0 ? <span className="text-emerald-600 font-medium">FREE</span> : <span className="font-semibold">{formatPrice(deliveryCharge)}</span>}
                  </div>
                  <div className="flex justify-between font-bold text-base border-t border-slate-100 pt-2 mt-2">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  disabled={!valid}
                  className="w-full mt-6 py-3.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 border-none cursor-pointer"
                >
                  {payment === 'cod' ? 'Place Order (COD)' : payment === 'upi' ? `Pay via UPI & Place Order` : 'Place Order (Netbanking)'}
                  <ChevronRight size={16} />
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-3">
                  By placing this order, you agree to our Terms & Conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
