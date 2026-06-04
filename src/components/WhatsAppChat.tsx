import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { SITE_CONFIG } from '../config';

const BIZ = SITE_CONFIG.businessWhatsApp;

function waLink(phone: string, text: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}

export default function WhatsAppChat() {
  return (
    <motion.a
      href={waLink(BIZ, `Hi! I want to browse ${SITE_CONFIG.siteName} 🛒`)}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-green-300/40 hover:shadow-green-400/50 transition-all duration-200 border-none cursor-pointer"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={26} />
    </motion.a>
  );
}
