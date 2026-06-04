import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface UserLocation {
  city: string;
  area?: string;
  lat?: number;
  lng?: number;
}

interface LocationContextType {
  location: UserLocation | null;
  isLoading: boolean;
  error: string | null;
  showPrompt: boolean;
  dismissPrompt: () => void;
  requestLocation: () => void;
  setLocation: (loc: UserLocation) => void;
  clearLocation: () => void;
}

const STORAGE_KEY = 'manyam-location';
const DISMISSED_KEY = 'manyam-location-dismissed';

function loadLocation(): UserLocation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function persistLocation(loc: UserLocation | null) {
  if (loc) localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  else localStorage.removeItem(STORAGE_KEY);
}

function wasDismissed(): boolean {
  try { return localStorage.getItem(DISMISSED_KEY) === 'true'; } catch { return false; }
}

function markDismissed() {
  try { localStorage.setItem(DISMISSED_KEY, 'true'); } catch { /* noop */ }
}

const LocationContext = createContext<LocationContextType | null>(null);

const FALLBACK_CITIES = [
  'Bangalore', 'Chennai', 'Hyderabad', 'Mumbai', 'Delhi', 'Pune',
  'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Coimbatore', 'Mysore',
  'Chandigarh', 'Bhopal', 'Indore', 'Nagpur', 'Surat', 'Visakhapatnam',
];

export { FALLBACK_CITIES };

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLoc] = useState<UserLocation | null>(() => loadLocation());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => { persistLocation(location); }, [location]);

  useEffect(() => {
    if (!location && !wasDismissed()) {
      const timer = setTimeout(() => setShowPrompt(true), 800);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const dismissPrompt = useCallback(() => {
    setShowPrompt(false);
    markDismissed();
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    setIsLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc({ city: 'Bangalore', area: 'Current Location', lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLoading(false);
        setShowPrompt(false);
      },
      () => {
        setError('Could not detect location. Please search manually.');
        setIsLoading(false);
      },
      { timeout: 5000 }
    );
  }, []);

  const setLocation = useCallback((loc: UserLocation) => {
    setLoc(loc);
    setError(null);
    setShowPrompt(false);
  }, []);

  const clearLocation = useCallback(() => { setLoc(null); }, []);

  return (
    <LocationContext.Provider value={{ location, isLoading, error, showPrompt, dismissPrompt, requestLocation, setLocation, clearLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}
