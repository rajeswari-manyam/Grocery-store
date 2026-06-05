import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import twilio from 'twilio';

import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'https://grocery-store-q4eh.onrender.com',
  'https://grocery-store-admin-df6f.onrender.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3001',
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(null, true);
  },
  credentials: true,
}));
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const waFrom = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

app.post('/api/whatsapp/send', async (req, res) => {
  const { to, message } = req.body;
  if (!to || !message) return res.status(400).json({ error: 'to and message are required' });
  if (!twilioClient) return res.status(500).json({ error: 'Twilio not configured' });
  try {
    const cleaned = to.replace(/\D/g, '');
    const full = cleaned.length === 10 ? `91${cleaned}` : cleaned;
    await twilioClient.messages.create({
      from: waFrom,
      to: `whatsapp:+${full}`,
      body: message,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/whatsapp/webhook', async (req, res) => {
  const text = (req.body.Body || '').toLowerCase().trim();
  const from = req.body.From || '';
  const phone = from.replace('whatsapp:', '').replace(/\D/g, '');

  let reply;
  const firstWord = text.split(/[\s!?.]+/)[0];

  if (['hi', 'hello', 'hey', 'hii', 'hy', 'hlo'].includes(firstWord)) {
    reply = `👋 *Welcome to MANYAM MART!* 🛒\n\nThanks for reaching out! 🙏\n\n🛒 *Browse our catalog:* https://grocery-store-q4eh.onrender.com\n\n👉 *Reply with:* Catalog, Track Order, or Help\n\nHappy shopping! 🎉`;
  } else if (text === 'help') {
    reply = `🤖 *MANYAM MART Commands*\n\n👉 *Catalog* — Get the product catalog link\n👉 *Track Order* — Track your order\n👉 *Help* — Show this menu\n\n🛒 Shop online: https://grocery-store-q4eh.onrender.com`;
  } else if (text === 'catalog' || /\bcatalog\b/.test(text)) {
    reply = `🛒 *MANYAM MART Catalog*\n\nShop all our products here:\nhttps://grocery-store-q4eh.onrender.com\n\n🌾 Millets | 🍚 Rice | 🌾 Flours\n🫘 Pulses | 🌰 Seeds | 🍜 Ready Products`;
  } else if (/^track/.test(text)) {
    reply = `📦 *Track Your Order*\n\nTo track your order, please visit:\nhttps://grocery-store-q4eh.onrender.com/orders\n\nOr reply with your *order ID* and I'll look it up!`;
  } else if (/\b(browse|shop|product)\b/.test(text)) {
    reply = `🛒 *Browse our products:* https://grocery-store-q4eh.onrender.com/products\n\n🌾 Millets | 🍚 Rice | 🌾 Flours\n🫘 Pulses | 🌰 Seeds | 🍜 Ready Products`;
  } else {
    reply = `Hi there! 👋\n\n🛒 *Shop now:* https://grocery-store-q4eh.onrender.com\n\nReply *help* for available commands.`;
  }

  try {
    if (twilioClient) {
      await twilioClient.messages.create({ from: waFrom, to: from, body: reply });
    }
    res.send('<Response></Response>');
  } catch {
    res.send('<Response></Response>');
  }
});

app.get('/api/status', (_, res) => {
  res.json({ connected: !!twilioClient, hasQr: false, error: null, phone: null });
});

app.get('*', (_, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

process.on('SIGINT', () => { process.exit(); });
process.on('SIGTERM', () => { process.exit(); });

app.listen(PORT, () => {
  console.log(`\n🚀 MANYAM MART - Backend Server`);
  console.log(`📡 Running on http://localhost:${PORT}`);
  console.log(`📋 API Endpoints:`);
  console.log(`   GET    /api/products`);
  console.log(`   GET    /api/products/:id`);
  console.log(`   POST   /api/products (admin)`);
  console.log(`   PUT    /api/products/:id (admin)`);
  console.log(`   DELETE /api/products/:id (admin)`);
  console.log(`   GET    /api/orders`);
  console.log(`   GET    /api/orders/:id`);
  console.log(`   POST   /api/orders`);
  console.log(`   PUT    /api/orders/:id/status (admin)`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   POST   /api/auth/register`);
  console.log(`   POST   /api/auth/admin-login`);
  console.log(`   GET    /api/auth/me`);
  console.log(`   GET    /api/auth/users`);
  console.log(`   GET    /api/profile`);
  console.log(`   PUT    /api/profile`);
  console.log(`   POST   /api/profile/addresses`);
  console.log(`   PUT    /api/profile/addresses/:id`);
  console.log(`   DELETE /api/profile/addresses/:id`);
  console.log(`   GET    /api/status`);
  console.log(`   POST   /api/whatsapp/send`);
  console.log(`   POST   /api/whatsapp/webhook`);
});
