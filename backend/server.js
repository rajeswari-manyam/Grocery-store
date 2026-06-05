import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

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

app.get('/api/status', (_, res) => {
  res.json({ connected: false, hasQr: false, error: null, phone: null });
});

app.get('*', (_, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  process.exit();
});
process.on('SIGTERM', () => {
  process.exit();
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
