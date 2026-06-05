import * as store from '../models/store.js';
import twilio from 'twilio';

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export async function sendOtp(req, res) {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone is required' });
  if (!twilioClient) return res.status(500).json({ error: 'Twilio not configured' });
  try {
    await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: `+91${phone}`, channel: 'sms' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function verifyOtp(req, res) {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP required' });
  if (!twilioClient) return res.status(500).json({ error: 'Twilio not configured' });
  try {
    const check = await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: `+91${phone}`, code: otp });
    if (check.status === 'approved') {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid OTP' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export function login(req, res) {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ error: 'phone and password are required' });
  }
  const user = store.authenticateUser(phone, password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ user, token: `Bearer ${phone}` });
}

export function register(req, res) {
  let { phone, name, email, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ error: 'phone and password are required' });
  }
  const existing = store.getUserByPhone(phone);
  if (existing) return res.status(409).json({ error: 'User already exists' });
  const user = store.createUser({ phone, name: name || '', email: email || '', password, role: 'customer' });
  res.status(201).json({ user, token: `Bearer ${phone}` });
}

export function me(req, res) {
  if (!req.userPhone) return res.status(401).json({ error: 'Unauthorized' });
  const user = store.getUserByPhone(req.userPhone);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...safe } = user;
  res.json(safe);
}

export function listUsers(req, res) {
  const users = store.getUsers();
  res.json(users);
}

export function adminLogin(req, res) {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ error: 'phone and password are required' });
  }
  const user = store.authenticateUser(phone, password);
  if (!user || user.role !== 'admin') {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }
  res.json({ user, token: 'admin-token' });
}
