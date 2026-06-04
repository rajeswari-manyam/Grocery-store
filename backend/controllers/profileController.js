import * as store from '../models/store.js';

export function getProfile(req, res) {
  if (!req.userPhone) return res.status(401).json({ error: 'Unauthorized' });
  const user = store.getUserByPhone(req.userPhone);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...safe } = user;
  res.json({ ...safe, addresses: user.addresses || [] });
}

export function updateProfile(req, res) {
  if (!req.userPhone) return res.status(401).json({ error: 'Unauthorized' });
  const { name, email } = req.body;
  const user = store.updateUser(req.userPhone, { name, email });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...safe } = user;
  res.json(safe);
}

export function addAddress(req, res) {
  if (!req.userPhone) return res.status(401).json({ error: 'Unauthorized' });
  const { label, name, phone, line1, line2, city, pincode, isDefault } = req.body;
  if (!label || !line1 || !city || !pincode) {
    return res.status(400).json({ error: 'label, line1, city, and pincode are required' });
  }
  const address = store.addUserAddress(req.userPhone, { label, name: name || '', phone: phone || '', line1, line2: line2 || '', city, pincode, isDefault: isDefault || false });
  res.status(201).json(address);
}

export function updateAddress(req, res) {
  if (!req.userPhone) return res.status(401).json({ error: 'Unauthorized' });
  const address = store.updateUserAddress(req.userPhone, req.params.id, req.body);
  if (!address) return res.status(404).json({ error: 'Address not found' });
  res.json(address);
}

export function deleteAddress(req, res) {
  if (!req.userPhone) return res.status(401).json({ error: 'Unauthorized' });
  const deleted = store.deleteUserAddress(req.userPhone, req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Address not found' });
  res.json({ success: true });
}
