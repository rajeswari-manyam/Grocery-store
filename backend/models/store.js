import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '..', 'data.json');

let data = null;

function normalizeProducts(products) {
  return products.map(p => ({
    ...p,
    images: p.images || (p.image ? [p.image] : []),
  }));
}

function load() {
  if (data) return data;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      data = JSON.parse(raw);
      if (!data.products || !data.orders || !data.users) throw new Error('Invalid schema');
      data.products = normalizeProducts(data.products);
    } else {
      data = { products: [], orders: [], users: [{ id: 'u1', phone: '9999999999', name: 'Admin', email: 'admin@manyammart.com', role: 'admin', password: 'admin123', addresses: [] }] };
      save();
    }
  } catch {
    data = { products: [], orders: [], users: [{ id: 'u1', phone: '9999999999', name: 'Admin', email: 'admin@manyammart.com', role: 'admin', password: 'admin123', addresses: [] }] };
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

export function clearAllProducts() {
  const db = load();
  db.products = [];
  save();
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
