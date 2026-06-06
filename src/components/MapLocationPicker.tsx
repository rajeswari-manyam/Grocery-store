import { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Search, Crosshair, Loader2, ChevronLeft } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface MapLocationPickerProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: { lat: number; lng: number; address: string; city: string; pincode: string }) => void;
}

async function reverseGeocode(lat: number, lng: number): Promise<{ display_name: string; city: string; pincode: string }> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`, {
      headers: { 'Accept-Language': 'en' },
    });
    const data = await res.json();
    const addr = data.address || {};
    return {
      display_name: data.display_name || '',
      city: addr.city || addr.town || addr.village || addr.county || addr.state_district || '',
      pincode: addr.postcode || '',
    };
  } catch {
    return { display_name: '', city: '', pincode: '' };
  }
}

async function searchLocation(query: string): Promise<{ lat: number; lng: number; display_name: string }[]> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`, {
      headers: { 'Accept-Language': 'en' },
    });
    const data = await res.json();
    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      display_name: item.display_name,
    }));
  } catch {
    return [];
  }
}

function MapController({ onMoveEnd, onMapReady }: { onMoveEnd: (lat: number, lng: number) => void; onMapReady: (map: L.Map) => void }) {
  useMapEvents({
    moveend(e) {
      const center = e.target.getCenter();
      onMoveEnd(center.lat, center.lng);
    },
  });
  const map = useMap();
  useEffect(() => { onMapReady(map); }, [map, onMapReady]);
  return null;
}

function FlyTo({ pos }: { pos: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.flyTo(pos, 17, { duration: 0.8 }); }, [pos, map]);
  return null;
}

export default function MapLocationPicker({ open, onClose, onConfirm }: MapLocationPickerProps) {
  const [center, setCenter] = useState<[number, number]>([20.5937, 78.9629]);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(true);
  const [geoLoading, setGeoLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ lat: number; lng: number; display_name: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const resolveAddress = useCallback(async (lat: number, lng: number) => {
    setResolving(true);
    const result = await reverseGeocode(lat, lng);
    setAddress(result.display_name);
    setCity(result.city);
    setPincode(result.pincode);
    setResolving(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setCenter(c);
        resolveAddress(c[0], c[1]);
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [open, resolveAddress]);

  const handleMoveEnd = useCallback((lat: number, lng: number) => {
    setCenter([lat, lng]);
    resolveAddress(lat, lng);
  }, [resolveAddress]);

  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
  }, []);

  const handleDetectLocation = () => {
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setCenter(c);
        resolveAddress(c[0], c[1]);
        setGeoLoading(false);
      },
      () => { setGeoLoading(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    const results = await searchLocation(q);
    setSearchResults(results);
    setSearching(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (searchQuery.trim()) handleSearch(searchQuery);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, handleSearch]);

  const handleSelectSearchResult = (lat: number, lng: number) => {
    setCenter([lat, lng]);
    resolveAddress(lat, lng);
    setShowSearch(false);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleConfirm = () => {
    onConfirm({ lat: center[0], lng: center[1], address, city, pincode });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[80vh] overflow-hidden flex flex-col relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-1">
              <h2 className="text-base font-bold text-slate-900">Set Your Location</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 bg-transparent border-none cursor-pointer">
                <span className="text-base">✕</span>
              </button>
            </div>

            {/* Search bar */}
            <div className="px-4 pb-2">
              <div
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-sm text-slate-500 cursor-pointer"
              >
                <Search size={14} className="text-slate-400" />
                <span className="text-xs">Search for area, street, landmark...</span>
              </div>
            </div>

            {/* Map area */}
            <div className="relative flex-1 min-h-[200px]">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
                  <Loader2 size={32} className="text-emerald-600 animate-spin" />
                </div>
              ) : (
                <MapContainer center={center} zoom={17} className="w-full h-full min-h-[200px] z-0" scrollWheelZoom={true} zoomControl={false}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapController onMoveEnd={handleMoveEnd} onMapReady={handleMapReady} />
                  <FlyTo pos={center} />
                </MapContainer>
              )}

              {/* Fixed pin in center */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none">
                <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
                  <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z" fill="#047857" />
                  <circle cx="16" cy="15" r="7" fill="white" />
                </svg>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-700 rounded-full opacity-60" style={{ filter: 'blur(2px)' }} />
              </div>

              {/* Current location button */}
              <button
                onClick={handleDetectLocation}
                disabled={geoLoading}
                className="absolute bottom-3 right-3 z-[1000] w-11 h-11 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all disabled:opacity-50 border-none cursor-pointer"
              >
                <Crosshair size={16} className={geoLoading ? 'animate-spin text-emerald-600' : 'text-slate-600'} />
              </button>

              <style>{`
                .leaflet-container { cursor: grab !important; }
                .leaflet-container:active { cursor: grabbing !important; }
                .leaflet-control-zoom { display: none; }
              `}</style>
            </div>

            {/* Bottom section */}
            <div className="px-4 pt-2 pb-4 border-t border-slate-100 space-y-2">
              {resolving ? (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Loader2 size={14} className="animate-spin" />
                  Getting address...
                </div>
              ) : address ? (
                <div>
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{address}</p>
                  {(city || pincode) && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      {[city, pincode].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              ) : null}

              <button
                onClick={handleConfirm}
                disabled={!address || resolving}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-semibold text-sm transition-all border-none cursor-pointer flex items-center justify-center gap-2"
              >
                <Navigation size={16} />
                Confirm Location
              </button>

              <p className="text-[10px] text-slate-400 text-center">
                Move the map to adjust your delivery location
              </p>
            </div>

            {/* Search overlay inside card */}
            <AnimatePresence>
              {showSearch && (
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="absolute inset-0 z-30 bg-white flex flex-col rounded-2xl overflow-hidden"
                >
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                    <button onClick={() => { setShowSearch(false); setSearchResults([]); setSearchQuery(''); }} className="p-1.5 rounded-full hover:bg-slate-100 bg-transparent border-none cursor-pointer">
                      <ChevronLeft size={22} className="text-slate-700" />
                    </button>
                    <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-100">
                      <Search size={16} className="text-slate-400 flex-shrink-0" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search for area, street, landmark..."
                        className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400"
                        autoFocus
                      />
                      {searching && <Loader2 size={14} className="text-emerald-600 animate-spin flex-shrink-0" />}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      <div className="py-2">
                        {searchResults.map((r, i) => (
                          <button
                            key={i}
                            onClick={() => handleSelectSearchResult(r.lat, r.lng)}
                            className="w-full text-left px-5 py-3.5 hover:bg-slate-50 transition-all border-none bg-transparent cursor-pointer flex items-start gap-3"
                          >
                            <Search size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-slate-700 leading-snug line-clamp-2">{r.display_name}</span>
                          </button>
                        ))}
                      </div>
                    ) : searchQuery.trim() && !searching ? (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <Search size={32} className="mb-2 opacity-50" />
                        <p className="text-sm">No results found</p>
                      </div>
                    ) : !searchQuery.trim() ? (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <Search size={32} className="mb-2 opacity-50" />
                        <p className="text-sm">Search for your area or landmark</p>
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
