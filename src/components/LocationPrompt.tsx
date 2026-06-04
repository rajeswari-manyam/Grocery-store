import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, MapPin, Search, X } from 'lucide-react';
import { useLocation as useLocationCtx, FALLBACK_CITIES } from '../context/LocationContext';

export default function LocationPrompt() {
  const { location, isLoading, showPrompt, dismissPrompt, requestLocation, setLocation } = useLocationCtx();
  const [locationSearch, setLocationSearch] = useState('');

  if (!showPrompt || location) return null;

  const filteredCities = FALLBACK_CITIES.filter(c =>
    c.toLowerCase().includes(locationSearch.toLowerCase())
  );

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center"
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="w-12 h-1 rounded-full bg-slate-200 mx-auto sm:hidden" />
              <button
                onClick={dismissPrompt}
                className="p-2 rounded-full hover:bg-slate-100 transition-all bg-transparent border-none cursor-pointer ml-auto"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <MapPin size={28} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Set Your Delivery Location</h2>
              <p className="text-sm text-slate-500 mt-1">Choose your city to see products and delivery available in your area</p>
            </div>

            <button
              onClick={() => { requestLocation(); }}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-all border-none cursor-pointer disabled:opacity-50 mb-4"
            >
              <Navigation size={18} />
              {isLoading ? 'Detecting your location...' : 'Detect my location'}
            </button>

            <div className="relative mb-3">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={locationSearch}
                onChange={e => setLocationSearch(e.target.value)}
                placeholder="Search your city..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {filteredCities.map(city => (
                <button
                  key={city}
                  onClick={() => { setLocation({ city }); setLocationSearch(''); }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all bg-transparent border-none cursor-pointer text-slate-600 hover:bg-slate-50"
                >
                  {city}
                </button>
              ))}
              {filteredCities.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No cities found</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
