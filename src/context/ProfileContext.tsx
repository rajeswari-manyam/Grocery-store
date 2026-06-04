import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getFromStorage, setToStorage } from '../utils/storage';
import { fetchProfile, updateProfileApi, addAddressApi, updateAddressApi, deleteAddressApi } from '../services/api';
import { useAuth } from './AuthContext';

export interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  addresses: Address[];
}

interface ProfileContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, updates: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  defaultAddress: Address | undefined;
}

const STORAGE_KEY = 'manyam-profile';

const defaultProfile: UserProfile = {
  name: '', phone: '', email: '', addresses: [],
};

function migrateAddresses(profile: UserProfile): UserProfile {
  return {
    ...profile,
    addresses: profile.addresses.map(a => ({
      ...a,
      name: 'name' in a ? a.name : '',
      phone: 'phone' in a ? a.phone : '',
    })),
  };
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(() =>
    migrateAddresses(getFromStorage<UserProfile>(STORAGE_KEY, defaultProfile))
  );

  useEffect(() => {
    setToStorage(STORAGE_KEY, profile);
  }, [profile]);

  useEffect(() => {
    if (user?.phone) {
      fetchProfile().then(backendProfile => {
        if (backendProfile) {
          setProfile(migrateAddresses({
            name: backendProfile.name || '',
            phone: backendProfile.phone || user.phone,
            email: backendProfile.email || '',
            addresses: backendProfile.addresses || [],
          }));
        }
      }).catch(() => {});
    }
  }, [user?.phone]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
    updateProfileApi(updates).catch(() => {});
  };

  const addAddress = (address: Omit<Address, 'id'>) => {
    const id = `addr-${Date.now()}`;
    setProfile(prev => ({
      ...prev,
      addresses: [
        ...prev.addresses.map(a => address.isDefault ? { ...a, isDefault: false } : a),
        { ...address, id },
      ],
    }));
    addAddressApi(address).catch(() => {});
  };

  const updateAddress = (id: string, updates: Partial<Address>) => {
    setProfile(prev => ({
      ...prev,
      addresses: prev.addresses.map(a => {
        if (a.id === id) return { ...a, ...updates };
        if (updates.isDefault) return { ...a, isDefault: false };
        return a;
      }),
    }));
    updateAddressApi(id, updates).catch(() => {});
  };

  const deleteAddress = (id: string) => {
    setProfile(prev => ({
      ...prev,
      addresses: prev.addresses.filter(a => a.id !== id),
    }));
    deleteAddressApi(id).catch(() => {});
  };

  const defaultAddress = profile.addresses.find(a => a.isDefault) || profile.addresses[0];

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, addAddress, updateAddress, deleteAddress, defaultAddress }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
