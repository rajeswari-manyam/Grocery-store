import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Phone, ArrowRight, ShoppingBag, CheckCircle, User, Clock } from 'lucide-react';
import { isBackendAvailable, sendCustomerQueryToBusiness, getPendingCount } from '../services/whatsappApi';
import { SITE_CONFIG } from '../config';

const BIZ = SITE_CONFIG.businessWhatsApp;

function waLink(phone: string, text: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}

type Step = 'chat' | 'number' | 'sent';

function getBotReply(input: string): string {
  const lower = input.toLowerCase().trim();
  if (/^(hi|hello|hey|hii|hlo)$/.test(lower)) {
    return `Hello! 👋 Welcome to ${SITE_CONFIG.siteName}!

🛒 Browse our catalog: ${SITE_CONFIG.siteUrl}

Reply with:
• *products* — Get all products link
• *track* — Track your order
• *contact* — Business info`;
  }
  if (/^(product|shop|catalog|browse)$/.test(lower)) {
    return `🛒 *Shop Now:* ${SITE_CONFIG.siteUrl}\n\nWe have millets, rice, flours, pulses, seeds & more!`;
  }
  if (/^track/.test(lower)) {
    return `📦 To track, reply: *track ORD-XXXXXXXX*\n\nOr visit: ${SITE_CONFIG.siteUrl}/orders`;
  }
  if (/^(contact|phone)$/.test(lower)) {
    return `📞 WhatsApp: ${BIZ}\nStore: ${SITE_CONFIG.siteUrl}`;
  }
  return `Thanks for your message! 🙏\n\n🛒 ${SITE_CONFIG.siteUrl}\n\nType *help* for options.`;
}

function formatMsg(text: string): string {
  return text
    .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
    .replace(/https?:\/\/[^\s]+/g, url => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-emerald-600 underline font-medium">${url}</a>`)
    .replace(/\n/g, '<br />');
}

export default function WhatsAppChat() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('chat');
  const [messages, setMessages] = useState<{ text: string; from: 'bot' | 'user' }[]>([
    { from: 'bot', text: `👋 Hi! I'm ${SITE_CONFIG.siteName} assistant. Type a message to get started!` },
  ]);
  const [input, setInput] = useState('');
  const [userNumber, setUserNumber] = useState('');
  const [sending, setSending] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'offline'>('checking');
  const [method, setMethod] = useState<'backend' | 'queued' | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      isBackendAvailable().then(up => setBackendStatus(up ? 'connected' : 'offline'));
      setPendingCount(getPendingCount());
    }
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, step]);

  const handleSendMessage = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    const botReply = getBotReply(text);
    setMessages(prev => [...prev, { from: 'user', text }, { from: 'bot', text: botReply }]);
    if (backendStatus === 'connected') {
      setStep('number');
    }
  };

  const sendViaBackend = async () => {
    if (!userNumber || userNumber.replace(/\D/g, '').length < 10) return;
    setSending(true);
    const clean = userNumber.replace(/\D/g, '');
    const userMsg = messages.find(m => m.from === 'user')?.text || 'Hi';

    const result = await sendCustomerQueryToBusiness(clean, userMsg);
    setMethod(result.method);

    if (result.sent) {
      setMessages(prev => [...prev, { from: 'bot', text: `✅ Your message has been sent to ${SITE_CONFIG.siteName}. We'll get back to you shortly!` }]);
    } else {
      setMessages(prev => [...prev, { from: 'bot', text: `📨 Your query has been saved. It will be sent to ${SITE_CONFIG.siteName} automatically when our system is online.` }]);
      setPendingCount(getPendingCount());
    }

    setSending(false);
    setStep('sent');
  };

  const chatWithUs = (prefill: string) => {
    window.open(waLink(BIZ, prefill), '_blank');
    setOpen(false);
  };

  const reset = () => {
    setStep('chat');
    setUserNumber('');
    setMessages([{ from: 'bot', text: `👋 Hi! I'm ${SITE_CONFIG.siteName} assistant. Type a message to get started!` }]);
    setMethod(null);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            style={{ maxHeight: 'min(600px, calc(100vh - 120px))' }}
          >
            <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 p-4 flex items-center gap-3 flex-shrink-0">
              <img src="/logo.jpeg" alt="MANYAM MART" className="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-sm">MANYAM MART</h3>
                <p className="text-[11px] text-emerald-100">
                  {backendStatus === 'connected' ? '🟢 Auto-send active' : '🟡 Will send when online'}
                </p>
              </div>
              {pendingCount > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-400/20 text-[10px] text-amber-200">
                  <Clock size={10} />
                  {pendingCount}
                </div>
              )}
              <button onClick={() => { setOpen(false); reset(); }} className="p-1.5 rounded-lg hover:bg-white/10 transition-all bg-transparent border-none cursor-pointer">
                <X size={18} className="text-white" />
              </button>
            </div>

            {step === 'chat' && (
              <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#efeae2]" style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4cfc4\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
              }}>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                        msg.from === 'user' ? 'bg-emerald-50 text-slate-800 rounded-br-sm' : 'bg-white text-slate-700 rounded-bl-sm'
                      }`}
                      dangerouslySetInnerHTML={{ __html: formatMsg(msg.text) }}
                    />
                  </div>
                ))}
                <div ref={endRef} />
              </div>
            )}

            {step === 'number' && (
              <div className="flex-1 overflow-y-auto p-5 bg-[#f8fafc] space-y-4">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                    <User size={24} className="text-emerald-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Enter your WhatsApp number</h2>
                  <p className="text-sm text-slate-500 mt-1">So we can contact you back</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700">+91</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={userNumber}
                      onChange={e => setUserNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10-digit number"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white"
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') sendViaBackend(); }}
                    />
                  </div>
                  <button
                    onClick={sendViaBackend}
                    disabled={userNumber.replace(/\D/g, '').length < 10 || sending}
                    className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-semibold text-sm transition-all border-none cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Send size={15} />
                    {sending ? 'Sending...' : 'Send to Business'}
                  </button>
                </div>

                <button onClick={() => { setStep('chat'); setUserNumber(''); }} className="w-full text-center text-sm text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer">
                  Back to chat
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                  <div className="relative flex justify-center text-xs text-slate-400"><span className="bg-[#f8fafc] px-2">or quick options</span></div>
                </div>

                <div className="space-y-2">
                  <button onClick={() => chatWithUs('Hi! I want to browse your products 🛒')} className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 font-medium text-sm transition-all cursor-pointer text-left">
                    <ShoppingBag size={16} className="text-emerald-500 flex-shrink-0" />
                    <span>Browse Products 🛒</span>
                    <ArrowRight size={15} className="ml-auto text-slate-300" />
                  </button>
                  <button onClick={() => chatWithUs('Hi! I need help with my order.\n\nOrder ID: ')} className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 font-medium text-sm transition-all cursor-pointer text-left">
                    <Phone size={16} className="text-emerald-500 flex-shrink-0" />
                    <span>Order Support 📦</span>
                    <ArrowRight size={15} className="ml-auto text-slate-300" />
                  </button>
                </div>
              </div>
            )}

            {step === 'sent' && (
              <div className="flex-1 overflow-y-auto p-5 bg-[#f8fafc] space-y-4 text-center py-8">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${method === 'backend' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                  {method === 'backend' ? <CheckCircle size={28} className="text-emerald-600" /> : <Clock size={28} className="text-amber-600" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {method === 'backend' ? 'Sent to Business! 🎉' : 'Queued for Sending'}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {method === 'backend'
                      ? 'Your message has been sent to MANYAM MART. We\'ll get back to you shortly!'
                      : 'Our WhatsApp service is offline. Your message is saved and will be sent automatically when the system is back online.'}
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <button onClick={reset} className="text-sm text-emerald-700 hover:text-emerald-800 font-semibold bg-transparent border-none cursor-pointer">
                    Start new chat
                  </button>
                </div>
              </div>
            )}

            {step === 'chat' && (
              <div className="border-t border-slate-200 p-3 bg-white flex-shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white placeholder:text-slate-400"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim()}
                    className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white flex items-center justify-center transition-all border-none cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Send size={16} />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 text-center mt-2">
                  {backendStatus === 'connected'
                    ? '🟢 Messages sent directly to business WhatsApp'
                    : pendingCount > 0
                      ? `🟡 ${pendingCount} message(s) queued — will send when online`
                      : '🟡 Backend offline — messages queued until online'}
                </p>
              </div>
            )}

            {(step === 'number' || step === 'sent') && (
              <div className="border-t border-slate-200 p-3 bg-white flex-shrink-0">
                <p className="text-[10px] text-slate-400 text-center">
                  {method === 'backend' ? '🟢 Delivered via WhatsApp Business API' : '🟡 Queued — auto-sends when system is online'}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-green-300/40 hover:shadow-green-400/50 transition-all duration-200 border-none cursor-pointer"
        aria-label="Chat with us"
      >
        {open ? <X size={24} /> : <MessageCircle size={26} />}
      </motion.button>
    </>
  );
}
