import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Search, Menu, X, MapPin, ChevronDown, User, Navigation } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLocation as useLocationCtx, FALLBACK_CITIES } from '../context/LocationContext';
import LoginPrompt from './LoginPrompt';

const PROTECTED_ROUTES = ['/products', '/cart', '/orders', '/profile', '/checkout'];

export default function Navbar({ onCartOpen }: { onCartOpen: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const { totalItems } = useCart();
  const { user, isLoggedIn, logout } = useAuth();
  const { location, isLoading, requestLocation, setLocation } = useLocationCtx();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const goTo = (href: string) => {
    const path = href.split('?')[0];
    if (!isLoggedIn && PROTECTED_ROUTES.some(r => path.startsWith(r))) {
      setShowLoginPrompt(true);
      return;
    }
    navigate(href);
    setMobileOpen(false);
  };

  const filteredCities = FALLBACK_CITIES.filter(c =>
    c.toLowerCase().includes(locationSearch.toLowerCase())
  );

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/96 backdrop-blur-md border-b border-slate-200 shadow-sm' : 'bg-white border-b border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-[72px] flex items-center justify-between gap-2">
          {/* Logo + Location */}
          <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
            <button
              className="flex items-center gap-2 bg-transparent border-none cursor-pointer flex-shrink-0"
              onClick={() => goTo('/')}
            >
              <img src="/logo.jpeg" alt="MANYAM MART" className="w-9 h-9 rounded-xl object-cover shadow-md shadow-emerald-200" />
              <div className="hidden sm:block">
                <span className="text-slate-900 text-lg font-bold tracking-tight">MANYAM</span>
                <span className="text-emerald-700 text-lg font-bold tracking-tight">MART</span>
              </div>
            </button>

            <div className="hidden sm:block w-px h-6 bg-slate-200" />

            <div className="relative" ref={locationRef}>
              <button
                onClick={() => setLocationOpen(!locationOpen)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm hover:bg-slate-100 transition-all bg-transparent border-none cursor-pointer max-w-[140px]"
              >
                <MapPin size={15} className="text-emerald-600 flex-shrink-0" />
                <span className="truncate text-slate-700 font-medium text-[13px]">
                  {location ? location.city : 'Select city'}
                </span>
                <ChevronDown size={13} className="text-slate-400 flex-shrink-0" />
              </button>

              <AnimatePresence>
                {locationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50"
                  >
                    <button
                      type="button"
                      onClick={() => { requestLocation(); setLocationOpen(false); }}
                      disabled={isLoading}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-sm hover:bg-emerald-100 transition-all border-none cursor-pointer disabled:opacity-50 mb-3"
                    >
                      <Navigation size={16} />
                      {isLoading ? 'Detecting...' : 'Detect my location'}
                    </button>
                    <div className="relative mb-3">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={locationSearch}
                        onChange={e => setLocationSearch(e.target.value)}
                        placeholder="Search city..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-0.5">
                      {filteredCities.map(city => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => { setLocation({ city }); setLocationOpen(false); setLocationSearch(''); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all bg-transparent border-none cursor-pointer ${
                            location?.city === city ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {city}
                        </button>
                      ))}
                      {filteredCities.length === 0 && (
                        <p className="text-xs text-slate-400 text-center py-4">No cities found</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md">
            <form
              onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) { goTo(`/products?search=${encodeURIComponent(searchQuery.trim())}`); setSearchOpen(false); setSearchQuery(''); } }}
              className="w-full"
            >
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2 border border-slate-200 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                <Search size={16} className="text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search millets, rice, dals..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400"
                />
              </div>
            </form>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all bg-transparent border-none cursor-pointer"
            >
              <Search size={18} />
            </button>

            {isLoggedIn ? (
              <button
                onClick={() => goTo('/profile')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-all bg-transparent border-none cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <User size={16} className="text-emerald-700" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[80px] truncate">
                  {user?.name || 'Profile'}
                </span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/login', { state: { from: routeLocation.pathname } })}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-all border-none cursor-pointer"
              >
                <User size={16} />
                <span className="hidden sm:inline">Login</span>
              </button>
            )}

            {isLoggedIn && (
              <button
                onClick={onCartOpen}
                className="relative p-2.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all bg-transparent border-none cursor-pointer"
              >
                <ShoppingCart size={18} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>
            )}

            <button
              className="md:hidden p-2.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-all bg-transparent border-none cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-slate-100 bg-white overflow-hidden md:hidden"
            >
              <form
                onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) { goTo(`/products?search=${encodeURIComponent(searchQuery.trim())}`); setSearchOpen(false); setSearchQuery(''); } }}
                className="px-4 py-3"
              >
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-200 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                  <Search size={18} className="text-slate-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search millets, rice, dals..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400"
                    autoFocus
                  />
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-white shadow-2xl md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <img src="/logo.jpeg" alt="MANYAM MART" className="w-8 h-8 rounded-lg object-cover" />
                  <span className="font-bold text-slate-900 text-lg">MANYAM MART</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 bg-transparent border-none cursor-pointer">
                  <X size={20} className="text-slate-600" />
                </button>
              </div>

              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>Deliver to: <span className="font-semibold text-slate-700">{location?.city || 'Select city'}</span></span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                {[
                  { label: 'Home', href: '/', icon: null as string | null },
                  ...(isLoggedIn ? [
                    { label: 'Shop All', href: '/products', icon: null as string | null },
                    { label: 'My Orders', href: '/orders', icon: null as string | null },
                    { label: 'Cart', href: '/cart', icon: null as string | null },
                  ] : []),
                  ...(isLoggedIn
                    ? [{ label: 'Profile', href: '/profile', icon: 'profile' as const }]
                    : [{ label: 'Login', href: '/login', icon: 'profile' as const }]
                  ),
                ].map(({ label, href, icon }) => (
                  <button
                    key={label}
                    onClick={() => goTo(href)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-all bg-transparent border-none cursor-pointer mb-1 ${
                      routeLocation.pathname === href ? 'text-emerald-700 bg-emerald-50' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {icon === 'profile' && isLoggedIn ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <User size={15} className="text-emerald-700" />
                      </div>
                    ) : icon === 'profile' ? (
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <User size={15} className="text-slate-500" />
                      </div>
                    ) : null}
                    {label}
                  </button>
                ))}
              </div>

              {isLoggedIn && (
                <div className="px-4 py-4 border-t border-slate-100">
                  <button
                    onClick={() => { logout(); setMobileOpen(false); navigate('/'); }}
                    className="w-full text-left px-4 py-3 rounded-xl text-[15px] font-medium text-red-600 hover:bg-red-50 transition-all bg-transparent border-none cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <LoginPrompt open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
    </>
  );
}
