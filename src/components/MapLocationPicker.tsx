import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Crosshair, Check, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapLocationPickerProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: { lat: number; lng: number; address: string; city: string; pincode: string }) => void;
}

function LocationMarker({ position, onDrag }: { position: [number, number]; onDrag: (pos: [number, number]) => void }) {
  useMapEvents({
    dragend(e: any) {
      const marker = e.target;
      const pos = marker.getLatLng();
      onDrag([pos.lat, pos.lng]);
    },
  });
  return <Marker draggable position={position} eventHandlers={{ dragend: (e) => { const m = e.target; const pos = m.getLatLng(); onDrag([pos.lat, pos.lng]); } }} />;
}

function FlyTo({ pos }: { pos: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.flyTo(pos, 16, { duration: 1 }); }, [pos, map]);
  return null;
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

export default function MapLocationPicker({ open, onClose, onConfirm }: MapLocationPickerProps) {
  const [center, setCenter] = useState<[number, number]>([20.5937, 78.9629]);
  const [markerPos, setMarkerPos] = useState<[number, number]>([20.5937, 78.9629]);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(true);
  const [geoLoading, setGeoLoading] = useState(false);
  const [resolving, setResolving] = useState(false);

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
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setCenter(c);
        setMarkerPos(c);
        resolveAddress(c[0], c[1]);
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [open, resolveAddress]);

  const handleDrag = (pos: [number, number]) => {
    setMarkerPos(pos);
    resolveAddress(pos[0], pos[1]);
  };

  const handleDetectAgain = () => {
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setCenter(c);
        setMarkerPos(c);
        resolveAddress(c[0], c[1]);
        setGeoLoading(false);
      },
      () => { setGeoLoading(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirm = () => {
    onConfirm({ lat: markerPos[0], lng: markerPos[1], address, city, pincode });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="flex items-center gap-2">
                <MapPin size={20} className="text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900">Set Your Location</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 bg-transparent border-none cursor-pointer">
                <span className="text-lg">✕</span>
              </button>
            </div>

            <div className="relative flex-1 min-h-[300px]">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                  <Loader2 size={32} className="text-emerald-600 animate-spin" />
                </div>
              ) : (
                <MapContainer center={center} zoom={16} className="w-full h-full min-h-[300px] z-0" scrollWheelZoom={true}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker position={markerPos} onDrag={handleDrag} />
                  <FlyTo pos={center} />
                </MapContainer>
              )}
              <style>{`
                .leaflet-container { cursor: grab !important; }
                .leaflet-container:active { cursor: grabbing !important; }
              `}</style>

              <button
                onClick={handleDetectAgain}
                disabled={geoLoading}
                className="absolute top-3 right-3 z-[1000] px-3 py-2 rounded-xl bg-white shadow-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-all bg-transparent cursor-pointer disabled:opacity-50"
              >
                <Crosshair size={16} className={geoLoading ? 'animate-spin' : ''} />
                {geoLoading ? 'Detecting...' : 'Detect'}
              </button>
            </div>

            <div className="p-5 border-t border-slate-100 space-y-3">
              {resolving ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 size={14} className="animate-spin" />
                  Getting address...
                </div>
              ) : address ? (
                <div className="space-y-1">
                  <p className="text-sm text-slate-700 font-medium">📍 {address}</p>
                  <div className="flex gap-2 text-xs text-slate-500">
                    {city && <span>🏙️ {city}</span>}
                    {pincode && <span>📮 {pincode}</span>}
                  </div>
                </div>
              ) : null}

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!address || resolving}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-40 border-none cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  Confirm Location
                </button>
              </div>

              <p className="text-[10px] text-slate-400 text-center">
                Drag the pin to set your exact delivery location
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
