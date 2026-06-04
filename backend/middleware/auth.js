export function adminAuth(req, res, next) {
  const token = req.headers.authorization;
  if (!token || token !== 'Bearer admin-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

export function userAuth(req, res, next) {
  const token = req.headers.authorization;
  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const phone = token.replace('Bearer ', '');
  if (!phone) return res.status(401).json({ error: 'Unauthorized' });
  req.userPhone = phone;
  next();
}
