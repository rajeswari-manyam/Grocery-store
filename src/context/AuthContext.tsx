import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { fetchProfile, registerUser } from '../services/api';

export interface User {
  phone: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (phone: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const STORAGE_KEY = 'manyam-user-auth';

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function persistUser(user: User | null) {
  if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_KEY);
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadUser());

  useEffect(() => { persistUser(user); }, [user]);

  useEffect(() => {
    if (user?.phone) {
      fetchProfile().then(profile => {
        if (profile) {
          setUser(prev => prev ? { ...prev, name: profile.name || prev.name, email: profile.email || prev.email } : prev);
        }
      }).catch(() => {});
    }
  }, [user?.phone]);

  const login = useCallback((phone: string) => {
    setUser({ phone, name: '', email: '' });
    registerUser(phone, `${phone}@otp`, '').catch(() => {});
  }, []);

  const logout = useCallback(() => { setUser(null); }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: user !== null, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
