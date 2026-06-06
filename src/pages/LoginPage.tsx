import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import MapLocationPicker from '../components/MapLocationPicker';
import { SITE_CONFIG } from '../config';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [showMap, setShowMap] = useState(false);
  const { login } = useAuth();
  const { addAddress } = useProfile();
  const navigate = useNavigate();
  const loc = useLocation();
  const from = (loc.state as any)?.from || '/';

  const handleMapConfirm = (data: { address: string; city: string; pincode: string; lat: number; lng: number }) => {
    addAddress({
      label: 'Home',
      name: '',
      phone,
      line1: data.address,
      line2: '',
      city: data.city,
      pincode: data.pincode,
      isDefault: true,
    });
    navigate(from, { replace: true });
  };

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    setLoading(true);
    try {
      const res = await fetch(`${SITE_CONFIG.backendUrl}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Failed to send OTP');
        setLoading(false);
        return;
      }
    } catch {
      alert('Network error. Please check backend connection.');
      setLoading(false);
      return;
    }
    setLoading(false);
    setStep('otp');
    setShowOtp(true);
    setTimeout(() => setShowOtp(false), 10000);
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;
    setOtpError('');
    setLoading(true);
    try {
      const res = await fetch(`${SITE_CONFIG.backendUrl}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (!data.success) {
        setOtpError(data.error || 'Invalid OTP');
        setLoading(false);
        return;
      }
    } catch {
      setOtpError('Network error. Please try again.');
      setLoading(false);
      return;
    }
    login(phone);
    setLoading(false);
    setShowMap(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="px-6 py-4 flex items-center gap-3">
        {step === 'otp' && (
          <button onClick={() => { setStep('phone'); setOtp(''); }} className="p-2 rounded-lg hover:bg-slate-100 bg-transparent border-none cursor-pointer">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <img src="/logo.jpeg" alt="MANYAM MART" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-bold text-slate-900 text-lg">MANYAM MART</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <AnimatePresence mode="wait">
            {step === 'phone' ? (
              <motion.form
                key="phone-step"
                onSubmit={sendOtp}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                    <Phone size={28} className="text-emerald-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900">Login or Sign Up</h1>
                  <p className="text-sm text-slate-500 mt-2">Enter your phone number to continue</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Phone Number</label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700">+91</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10-digit number"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={phone.length < 10 || loading}
                  className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-semibold text-sm transition-all border-none cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>

                <p className="text-xs text-slate-400 text-center">
                  By continuing, you agree to our Terms & Privacy Policy
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="otp-step"
                onSubmit={verifyOtp}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                    <Lock size={28} className="text-amber-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900">Enter OTP</h1>
                  <p className="text-sm text-slate-500 mt-2">
                    Code sent to <span className="font-semibold text-slate-700">+91 {phone}</span>
                  </p>
                  {showOtp && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                      <p className="text-sm text-emerald-700 font-semibold">✅ OTP sent to your phone</p>
                    </motion.div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">OTP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpError(''); }}
                    placeholder="Enter 6-digit OTP"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 text-center text-lg tracking-[0.5em] font-bold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                    autoFocus
                  />
                  {otpError && (
                    <p className="text-xs text-red-500 mt-1.5 text-center">{otpError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={otp.length < 4 || loading}
                  className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-semibold text-sm transition-all border-none cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('phone'); setOtp(''); }}
                  className="w-full text-center text-sm text-emerald-700 font-semibold hover:text-emerald-800 bg-transparent border-none cursor-pointer"
                >
                  Change phone number
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <MapLocationPicker
        open={showMap}
        onClose={() => navigate(from, { replace: true })}
        onConfirm={handleMapConfirm}
      />
    </div>
  );
}
