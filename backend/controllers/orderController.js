import * as store from '../models/store.js';

export function list(req, res) {
  const orders = store.getOrders();
  const { status, phone } = req.query;
  let filtered = orders;
  if (status) filtered = filtered.filter(o => o.status === status);
  if (phone) filtered = filtered.filter(o => o.phone === phone || o.address?.phone === phone);
  res.json(filtered.sort((a, b) => new Date(b.date) - new Date(a.date)));
}

export function getById(req, res) {
  const order = store.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
}

export function create(req, res) {
  const { items, total, payment, address } = req.body;
  if (!items || !total || !payment || !address) {
    return res.status(400).json({ error: 'items, total, payment, and address are required' });
  }
  const order = store.createOrder({ items, total, payment, address, phone: address?.phone || '', status: 'Confirmed' });
  res.status(201).json(order);
}

export function updateStatus(req, res) {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'status is required' });
  const order = store.updateOrderStatus(req.params.id, status);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
}
