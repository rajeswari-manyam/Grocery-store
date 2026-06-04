import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

let client = null;
let connected = false;
let qrCode = null;
let lastError = null;

function initClient() {
  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] },
  });

  client.on('qr', (qr) => {
    qrCode = qr;
    connected = false;
    console.log('\n🔐 WhatsApp QR Code (scan with your phone):');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    connected = true;
    qrCode = null;
    lastError = null;
    console.log('✅ WhatsApp client connected!');
    console.log(`📱 Phone: ${client.info?.pushname || 'Unknown'}`);
  });

  client.on('disconnected', (reason) => {
    connected = false;
    lastError = `Disconnected: ${reason}`;
    console.log(`❌ WhatsApp disconnected: ${reason}`);
    console.log('🔄 Reconnecting in 10 seconds...');
    setTimeout(() => {
      try { client.initialize(); } catch {}
    }, 10000);
  });

  client.on('auth_failure', (msg) => {
    connected = false;
    lastError = `Auth failure: ${msg}`;
    console.error('❌ Auth failed:', msg);
  });

  client.on('message', async (message) => {
    const text = message.body.toLowerCase().trim();
    const from = message.from;

    console.log(`📩 Incoming from ${from}: ${message.body}`);

    try {
      if (['hi', 'hello', 'hey', 'hii', 'hy'].includes(text)) {
        const reply =
          `👋 *Welcome to MANYAM MART!* 🛒\n\n` +
          `Thanks for reaching out! 🙏\n\n` +
          `🛒 *Browse our catalog:* https://grocery-store-one-sigma.vercel.app\n\n` +
          `Reply with:\n` +
          `• *help* — See all commands\n` +
          `• *track* — Track your order\n` +
          `• *catalog* — Get product links\n\n` +
          `Happy shopping! 🎉`;
        await message.reply(reply);
        console.log(`✅ Auto-replied to greeting from ${from}`);
      } else if (text === 'help') {
        const reply =
          `🤖 *MANYAM MART Commands*\n\n` +
          `• *catalog* — Get the product catalog link\n` +
          `• *track* — Track your order\n` +
          `• *order* — Check order status\n` +
          `• *help* — Show this menu\n\n` +
          `🛒 Shop online: https://grocery-store-one-sigma.vercel.app`;
        await message.reply(reply);
      } else if (text === 'catalog') {
        const reply =
          `🛒 *MANYAM MART Catalog*\n\n` +
          `Shop all our products here:\n` +
          `https://grocery-store-one-sigma.vercel.app\n\n` +
          `🌾 Millets | 🍚 Rice | 🌾 Flours\n` +
          `🫘 Pulses | 🌰 Seeds | 🍜 Ready Products`;
        await message.reply(reply);
      } else if (text === 'track' || text === 'track order') {
        const reply =
          `📦 *Track Your Order*\n\n` +
          `To track your order, please visit:\n` +
          `https://grocery-store-one-sigma.vercel.app/orders\n\n` +
          `Or reply with your *order ID* and we'll look it up for you!`;
        await message.reply(reply);
      }
    } catch (err) {
      console.error(`❌ Auto-reply failed for ${from}:`, err.message);
    }
  });

  client.initialize();
}

initClient();

app.get('/api/status', (_, res) => {
  res.json({
    connected,
    hasQr: !!qrCode,
    error: lastError,
    phone: client?.info?.pushname || null,
  });
});

app.get('/api/qr', (_, res) => {
  if (qrCode) {
    res.json({ qr: qrCode });
  } else if (connected) {
    res.json({ connected: true });
  } else {
    res.json({ qr: null });
  }
});

app.post('/api/send-whatsapp', async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: 'Missing "to" or "message" fields' });
  }

  if (!client || !connected) {
    return res.status(503).json({
      error: 'WhatsApp not connected',
      hint: 'Scan the QR code first. Run: curl http://localhost:3001/api/qr',
    });
  }

  try {
    let cleaned = to.replace(/\D/g, '');
    if (cleaned.length === 10) cleaned = `91${cleaned}`;
    const chatId = cleaned.includes('@c.us') ? cleaned : `${cleaned}@c.us`;
    const sent = await client.sendMessage(chatId, message);
    console.log(`✅ Message sent to +${cleaned}`);
    res.json({ success: true, messageId: sent.id.id });
  } catch (err) {
    console.error('❌ Send failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/send-catalog', async (req, res) => {
  const { to } = req.body;
  if (!to) return res.status(400).json({ error: 'Missing "to" field' });

  const message =
    `👋 *Welcome to MANYAM MART!* 🛒\n\n` +
    `Thank you for your interest. Here's our complete product catalog:\n\n` +
    `🛒 *Shop Now:* https://grocery-store-one-sigma.vercel.app\n\n` +
    `Browse our range of:\n` +
    `🌾 Millets & Healthy Grains\n` +
    `🍚 Rice Varieties\n` +
    `🌾 Flours & Powders\n` +
    `🫘 Pulses & Lentils\n` +
    `🌰 Seeds & Health Add-Ons\n` +
    `🍜 Ready Products\n\n` +
    `Reply *help* to see all options or *track* to track your order.\n\n` +
    `Happy shopping! 🎉`;

  req.body.message = message;
  return app.handle(req, res, 'send-whatsapp');
});

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
  console.log(`   GET    /api/qr`);
  console.log(`   POST   /api/send-whatsapp`);
  console.log(`   POST   /api/send-catalog`);
});
