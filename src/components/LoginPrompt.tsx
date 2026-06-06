import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoginPromptProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginPrompt({ open, onClose }: LoginPromptProps) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center relative"
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 bg-transparent border-none cursor-pointer">
              <X size={18} className="text-slate-400" />
            </button>

            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <LogIn size={24} className="text-emerald-700" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">Login Required</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Please log in to explore our products and place orders.
            </p>

            <button
              onClick={() => { onClose(); navigate('/login'); }}
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-all border-none cursor-pointer"
            >
              Login Now
            </button>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
