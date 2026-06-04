import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Plus, Pencil, Trash2, Check, Package, LogOut, ChevronRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import { useProfile, type Address } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';

const labelColors: Record<string, string> = {
  Home: 'bg-emerald-100 text-emerald-700',
  Work: 'bg-blue-100 text-blue-700',
  Other: 'bg-amber-100 text-amber-700',
};

export default function ProfilePage() {
  const { profile, updateProfile, addAddress, updateAddress, deleteAddress } = useProfile();
  const { user, isLoggedIn, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || profile.name, phone: user?.phone || profile.phone, email: user?.email || profile.email });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState({ label: '', line1: '', line2: '', city: '', pincode: '', isDefault: false });

  const saveProfile = () => {
    updateProfile(form);
    updateUser({ name: form.name, phone: form.phone, email: form.email });
    setEditing(false);
  };

  const openNewAddress = () => {
    setAddrForm({ label: '', line1: '', line2: '', city: '', pincode: '', isDefault: false });
    setEditingAddress(null);
    setShowAddressForm(true);
  };

  const openEditAddress = (a: Address) => {
    setAddrForm({ label: a.label, line1: a.line1, line2: a.line2, city: a.city, pincode: a.pincode, isDefault: a.isDefault });
    setEditingAddress(a.id);
    setShowAddressForm(true);
  };

  const saveAddress = () => {
    if (editingAddress) {
      updateAddress(editingAddress, addrForm);
    } else {
      addAddress(addrForm);
    }
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  const displayName = user?.name || profile.name || 'User';
  const initial = displayName !== 'User' ? displayName[0].toUpperCase() : 'U';

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar onCartOpen={() => setCartOpen(true)} />
        <div className="pt-[72px]">
          <div className="max-w-md mx-auto px-4 py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <User size={36} className="text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Login to view your profile</h2>
            <p className="text-sm text-slate-500 mb-6">Sign in to manage your account, addresses, and orders</p>
            <button
              onClick={() => navigate('/login', { state: { from: '/profile' } })}
              className="px-8 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-all border-none cursor-pointer"
            >
              Login Now
            </button>
          </div>
        </div>
        <Footer />
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <div className="pt-[88px]">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-20">
          <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-slate-100">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md shadow-emerald-200 flex-shrink-0">
              <span className="text-2xl font-bold text-white">{initial}</span>
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-2">
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full Name" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold focus:outline-none focus:border-emerald-400" />
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-400" />
                  <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-400" />
                </div>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-slate-900 truncate">{displayName}</h1>
                  {user?.email || profile.email ? <p className="text-xs text-slate-400 truncate">{user?.email || profile.email}</p> : null}
                </>
              )}
            </div>
            <button
              onClick={() => { if (editing) saveProfile(); else { setForm({ name: user?.name || profile.name, phone: user?.phone || profile.phone, email: user?.email || profile.email }); setEditing(true); } }}
              className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-all px-3 py-2 rounded-lg hover:bg-emerald-50 bg-transparent border-none cursor-pointer flex-shrink-0"
            >
              {editing ? <><Check size={15} /> Save</> : <><Pencil size={14} /> Edit</>}
            </button>
          </div>

          <button
            onClick={() => navigate('/orders')}
            className="w-full bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-slate-100 hover:border-emerald-200 transition-all text-left bg-transparent cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Package size={22} className="text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900">My Orders</h3>
              <p className="text-xs text-slate-400">View all your orders and track delivery</p>
            </div>
            <ChevronRight size={18} className="text-slate-300 flex-shrink-0" />
          </button>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center">
                  <MapPin size={22} className="text-sky-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Saved Addresses</h3>
                  <p className="text-xs text-slate-400">{profile.addresses.length} address{profile.addresses.length !== 1 ? 'es' : ''}</p>
                </div>
              </div>
              <button onClick={openNewAddress} className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 px-3 py-2 rounded-lg hover:bg-emerald-50 transition-all bg-transparent border-none cursor-pointer">
                <Plus size={15} /> Add
              </button>
            </div>

            {profile.addresses.length === 0 && !showAddressForm && (
              <p className="text-sm text-slate-400 text-center py-6">No addresses saved yet.</p>
            )}

            <div className="space-y-3">
              <AnimatePresence>
                {profile.addresses.map(a => (
                  <motion.div key={a.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${labelColors[a.label] || 'bg-slate-100 text-slate-600'}`}>
                          {a.label}
                        </span>
                        {a.isDefault && (
                          <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Star size={10} /> Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
                      <p className="text-sm text-slate-500">{a.city} — {a.pincode}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => openEditAddress(a)} className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2.5 py-1 rounded-lg transition-all bg-transparent border-none cursor-pointer flex items-center gap-1">
                          <Pencil size={12} /> Edit
                        </button>
                        <button onClick={() => deleteAddress(a.id)} className="text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-all bg-transparent border-none cursor-pointer flex items-center gap-1">
                          <Trash2 size={12} /> Remove
                        </button>
                        {!a.isDefault && (
                          <button onClick={() => updateAddress(a.id, { isDefault: true })} className="text-xs font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-2.5 py-1 rounded-lg transition-all bg-transparent border-none cursor-pointer flex items-center gap-1">
                            <Star size={12} /> Make Default
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {showAddressForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      {['Home', 'Work', 'Other'].map(label => (
                        <button
                          key={label}
                          onClick={() => setAddrForm(f => ({ ...f, label }))}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all bg-transparent cursor-pointer ${
                            addrForm.label === label
                              ? 'border-emerald-400 bg-emerald-100 text-emerald-700'
                              : 'border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input value={addrForm.line1} onChange={e => setAddrForm(f => ({ ...f, line1: e.target.value }))} placeholder="Address Line 1" className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white" />
                      <input value={addrForm.line2} onChange={e => setAddrForm(f => ({ ...f, line2: e.target.value }))} placeholder="Address Line 2 (optional)" className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white" />
                      <input value={addrForm.city} onChange={e => setAddrForm(f => ({ ...f, city: e.target.value }))} placeholder="City" className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white" />
                      <input value={addrForm.pincode} onChange={e => setAddrForm(f => ({ ...f, pincode: e.target.value }))} placeholder="Pincode" className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={addrForm.isDefault} onChange={e => setAddrForm(f => ({ ...f, isDefault: e.target.checked }))} className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                      <span className="text-sm text-slate-600">Set as default address</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <button onClick={() => { setShowAddressForm(false); setEditingAddress(null); }} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all bg-white cursor-pointer">Cancel</button>
                    <button onClick={saveAddress} disabled={!addrForm.label || !addrForm.line1 || !addrForm.city || !addrForm.pincode} className="flex-1 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-all disabled:opacity-40 border-none cursor-pointer">
                      {editingAddress ? 'Update' : 'Save'} Address
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-slate-100 hover:border-red-200 transition-all text-left bg-transparent cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <LogOut size={22} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900">Logout</h3>
              <p className="text-xs text-slate-400">Sign out of your account</p>
            </div>
            <ChevronRight size={18} className="text-slate-300 flex-shrink-0" />
          </button>
        </div>
      </div>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
