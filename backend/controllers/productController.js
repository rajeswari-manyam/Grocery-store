import * as store from '../models/store.js';

export function list(req, res) {
  const products = store.getProducts();
  const { category } = req.query;
  if (category) {
    return res.json(products.filter(p => p.category === category));
  }
  res.json(products);
}

export function getById(req, res) {
  const product = store.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
}

export function create(req, res) {
  const { name, category, price, originalPrice, image, unit, description, inStock, isFlashSale, discount } = req.body;
  if (!name || !category || !price || !unit) {
    return res.status(400).json({ error: 'name, category, price, and unit are required' });
  }
  const product = store.createProduct({ name, category, price, originalPrice: originalPrice || null, image: image || '📦', unit, description: description || '', inStock: inStock ?? true, isFlashSale: isFlashSale ?? false, discount: discount || null });
  res.status(201).json(product);
}

export function update(req, res) {
  const product = store.updateProduct(req.params.id, req.body);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
}

export function remove(req, res) {
  const deleted = store.deleteProduct(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Product not found' });
  res.json({ success: true });
}
