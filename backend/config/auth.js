const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'pasarin_rahasia_default';

function butuhLogin(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token tidak ditemukan, silakan login.' });
  }
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload; // { id, nama, email, role }
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token tidak valid atau sudah kedaluwarsa.' });
  }
}

function butuhAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Akses ditolak. Hanya admin yang boleh mengakses ini.' });
  }
  next();
}

module.exports = { butuhLogin, butuhAdmin, SECRET };
