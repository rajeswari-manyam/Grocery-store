import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '..', 'data.json');

const defaultProducts = [
  { id: 'm1', name: 'Ragi (Finger Millet)', category: 'millets', price: 85, originalPrice: 100, image: '🌾', unit: '1 kg', description: 'Nutrient-rich finger millet. High in calcium and iron.', inStock: true, isFlashSale: true, discount: 15 },
  { id: 'm2', name: 'Jowar (Sorghum)', category: 'millets', price: 75, originalPrice: null, image: '🌾', unit: '1 kg', description: 'Gluten-free whole sorghum grain. Rich in protein and fiber.', inStock: true, isFlashSale: false, discount: null },
  { id: 'm3', name: 'Bajra (Pearl Millet)', category: 'millets', price: 70, originalPrice: 85, image: '🌾', unit: '1 kg', description: 'Pearl millet rich in iron and magnesium.', inStock: true, isFlashSale: true, discount: 18 },
  { id: 'm4', name: 'Foxtail Millet', category: 'millets', price: 120, originalPrice: null, image: '🌾', unit: '500 g', description: 'Low glycemic index millet. Great for diabetes-friendly meals.', inStock: true, isFlashSale: false, discount: null },
  { id: 'm5', name: 'Little Millet', category: 'millets', price: 110, originalPrice: null, image: '🌾', unit: '500 g', description: 'Tiny nutrient-packed millet. High in fiber.', inStock: true, isFlashSale: false, discount: null },
  { id: 'm6', name: 'Barnyard Millet', category: 'millets', price: 115, originalPrice: 135, image: '🌾', unit: '500 g', description: 'Light and easily digestible millet.', inStock: true, isFlashSale: true, discount: 15 },
  { id: 'r1', name: 'Basmati Rice', category: 'rice', price: 220, originalPrice: 260, image: '🍚', unit: '1 kg', description: 'Premium long-grain basmati rice. Ideal for biryani.', inStock: true, isFlashSale: true, discount: 15 },
  { id: 'r2', name: 'Sona Masoori Rice', category: 'rice', price: 140, originalPrice: null, image: '🍚', unit: '1 kg', description: 'Light and aromatic medium-grain rice.', inStock: true, isFlashSale: false, discount: null },
  { id: 'r3', name: 'Brown Rice', category: 'rice', price: 160, originalPrice: 190, image: '🍚', unit: '1 kg', description: 'Unpolished whole grain rice. Rich in fiber.', inStock: true, isFlashSale: true, discount: 16 },
  { id: 'r4', name: 'Raw Rice', category: 'rice', price: 130, originalPrice: null, image: '🍚', unit: '1 kg', description: 'Uncooked raw rice. Perfect for everyday cooking.', inStock: true, isFlashSale: false, discount: null },
  { id: 'r5', name: 'Boiled Rice', category: 'rice', price: 120, originalPrice: null, image: '🍚', unit: '1 kg', description: 'Parboiled rice with retained nutrients.', inStock: true, isFlashSale: false, discount: null },
  { id: 'f1', name: 'Wheat Atta', category: 'flours', price: 55, originalPrice: null, image: '🌾', unit: '5 kg', description: 'Stone-ground whole wheat flour.', inStock: true, isFlashSale: false, discount: null },
  { id: 'f2', name: 'Ragi Flour', category: 'flours', price: 90, originalPrice: 110, image: '🌾', unit: '1 kg', description: 'Fine ragi flour from premium finger millets.', inStock: true, isFlashSale: true, discount: 18 },
  { id: 'f3', name: 'Jowar Flour', category: 'flours', price: 80, originalPrice: null, image: '🌾', unit: '1 kg', description: 'Gluten-free jowar flour. Perfect for bhakri.', inStock: true, isFlashSale: false, discount: null },
  { id: 'f4', name: 'Bajra Flour', category: 'flours', price: 75, originalPrice: null, image: '🌾', unit: '1 kg', description: 'Traditional pearl millet flour.', inStock: true, isFlashSale: false, discount: null },
  { id: 'f5', name: 'Multigrain Flour', category: 'flours', price: 65, originalPrice: 80, image: '🌾', unit: '1 kg', description: 'Blend of wheat, jowar, bajra and ragi flours.', inStock: true, isFlashSale: true, discount: 19 },
  { id: 'p1', name: 'Toor Dal', category: 'pulses', price: 145, originalPrice: null, image: '🫘', unit: '1 kg', description: 'Premium split pigeon peas. Essential for sambar.', inStock: true, isFlashSale: false, discount: null },
  { id: 'p2', name: 'Moong Dal', category: 'pulses', price: 130, originalPrice: 155, image: '🫘', unit: '1 kg', description: 'Split green gram. Light and easy to digest.', inStock: true, isFlashSale: true, discount: 16 },
  { id: 'p3', name: 'Chana Dal', category: 'pulses', price: 110, originalPrice: null, image: '🫘', unit: '1 kg', description: 'Split chickpea lentils. Rich in protein.', inStock: true, isFlashSale: false, discount: null },
  { id: 'p4', name: 'Urad Dal', category: 'pulses', price: 150, originalPrice: null, image: '🫘', unit: '1 kg', description: 'Black gram lentils. Essential for dal makhani.', inStock: true, isFlashSale: false, discount: null },
  { id: 'p5', name: 'Masoor Dal', category: 'pulses', price: 125, originalPrice: null, image: '🫘', unit: '1 kg', description: 'Red lentils quick cooking. Rich in protein.', inStock: true, isFlashSale: false, discount: null },
  { id: 's1', name: 'Flax Seeds (Alsi)', category: 'seeds', price: 95, originalPrice: null, image: '🌰', unit: '250 g', description: 'Omega-3 rich brown flaxseeds.', inStock: true, isFlashSale: false, discount: null },
  { id: 's2', name: 'Chia Seeds', category: 'seeds', price: 180, originalPrice: 220, image: '🌰', unit: '200 g', description: 'Premium black chia seeds. Rich in antioxidants.', inStock: true, isFlashSale: true, discount: 18 },
  { id: 's3', name: 'Sunflower Seeds', category: 'seeds', price: 85, originalPrice: null, image: '🌰', unit: '200 g', description: 'Crunchy sunflower seeds. Rich in Vitamin E.', inStock: true, isFlashSale: false, discount: null },
  { id: 's4', name: 'Pumpkin Seeds', category: 'seeds', price: 120, originalPrice: 145, image: '🌰', unit: '200 g', description: 'Iron-rich pumpkin seeds.', inStock: true, isFlashSale: true, discount: 17 },
  { id: 's5', name: 'Sesame Seeds (Til)', category: 'seeds', price: 70, originalPrice: null, image: '🌰', unit: '200 g', description: 'Premium white sesame seeds. Rich in calcium.', inStock: true, isFlashSale: false, discount: null },
  { id: 'x1', name: 'Millet Noodles', category: 'ready', price: 65, originalPrice: 80, image: '🍜', unit: '200 g', description: 'Healthy instant noodles made from millets.', inStock: true, isFlashSale: true, discount: 19 },
  { id: 'x2', name: 'Millet Pasta', category: 'ready', price: 75, originalPrice: null, image: '🍝', unit: '200 g', description: 'Whole grain millet pasta.', inStock: true, isFlashSale: false, discount: null },
  { id: 'x3', name: 'Ragi Dosa Mix', category: 'ready', price: 55, originalPrice: null, image: '🥞', unit: '500 g', description: 'Instant ragi dosa mix.', inStock: true, isFlashSale: false, discount: null },
  { id: 'x4', name: 'Millet Upma Mix', category: 'ready', price: 60, originalPrice: 75, image: '🥣', unit: '500 g', description: 'Quick millet upma mix with vegetables.', inStock: true, isFlashSale: true, discount: 20 },
];

let data = null;

function load() {
  if (data) return data;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      data = JSON.parse(raw);
      if (!data.products || !data.orders || !data.users) throw new Error('Invalid schema');
    } else {
      throw new Error('No data file');
    }
  } catch {
    data = {
      products: [...defaultProducts],
      orders: [],
      users: [
        { id: 'u1', phone: '9999999999', name: 'Admin', email: 'admin@manyammart.com', role: 'admin', password: 'admin123', addresses: [] },
      ],
    };
    save();
  }
  return data;
}

function save() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function getProducts() {
  return load().products;
}

export function getProductById(id) {
  return load().products.find(p => p.id === id) || null;
}

export function createProduct(productData) {
  const db = load();
  const id = `p${Date.now()}`;
  const product = { id, ...productData };
  db.products.push(product);
  save();
  return product;
}

export function updateProduct(id, updates) {
  const db = load();
  const index = db.products.findIndex(p => p.id === id);
  if (index === -1) return null;
  db.products[index] = { ...db.products[index], ...updates };
  save();
  return db.products[index];
}

export function deleteProduct(id) {
  const db = load();
  const index = db.products.findIndex(p => p.id === id);
  if (index === -1) return false;
  db.products.splice(index, 1);
  save();
  return true;
}

export function getOrders() {
  return load().orders;
}

export function getOrderById(id) {
  return load().orders.find(o => o.id === id) || null;
}

export function createOrder(orderData) {
  const db = load();
  const id = `ORD-${Date.now()}`;
  const order = { id, date: new Date().toISOString(), ...orderData };
  db.orders.push(order);
  save();
  return order;
}

export function updateOrderStatus(id, status) {
  const db = load();
  const index = db.orders.findIndex(o => o.id === id);
  if (index === -1) return null;
  db.orders[index].status = status;
  save();
  return db.orders[index];
}

export function getUsers() {
  return load().users.map(({ password, ...u }) => u);
}

export function getUserByPhone(phone) {
  return load().users.find(u => u.phone === phone) || null;
}

export function createUser(userData) {
  const db = load();
  const id = `u${Date.now()}`;
  const user = { id, ...userData };
  db.users.push(user);
  save();
  const { password, ...safe } = user;
  return safe;
}

export function authenticateUser(phone, password) {
  const user = load().users.find(u => u.phone === phone && u.password === password);
  if (!user) return null;
  const { password: _, ...safe } = user;
  return safe;
}

export function updateUser(phone, updates) {
  const db = load();
  const index = db.users.findIndex(u => u.phone === phone);
  if (index === -1) return null;
  db.users[index] = { ...db.users[index], ...updates };
  save();
  return db.users[index];
}

export function addUserAddress(phone, addressData) {
  const db = load();
  const index = db.users.findIndex(u => u.phone === phone);
  if (index === -1) return null;
  if (!db.users[index].addresses) db.users[index].addresses = [];
  const id = `addr-${Date.now()}`;
  const address = { id, ...addressData };
  db.users[index].addresses.push(address);
  save();
  return address;
}

export function updateUserAddress(phone, addressId, updates) {
  const db = load();
  const user = db.users.find(u => u.phone === phone);
  if (!user || !user.addresses) return null;
  const idx = user.addresses.findIndex(a => a.id === addressId);
  if (idx === -1) return null;
  user.addresses[idx] = { ...user.addresses[idx], ...updates };
  save();
  return user.addresses[idx];
}

export function deleteUserAddress(phone, addressId) {
  const db = load();
  const user = db.users.find(u => u.phone === phone);
  if (!user || !user.addresses) return false;
  const idx = user.addresses.findIndex(a => a.id === addressId);
  if (idx === -1) return false;
  user.addresses.splice(idx, 1);
  save();
  return true;
}
