const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { SECRET } = require('../config/auth');

const router = express.Router();

// Daftar akun baru
router.post('/register', async (req, res) => {
  try {
    const { nama, email, password } = req.body;
    if (!nama || !email || !password) {
      return res.status(400).json({ error: 'Nama, email, dan password wajib diisi.' });
    }
    const [exist] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exist.length > 0) {
      return res.status(409).json({ error: 'Email sudah terdaftar.' });
    }
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (nama, email, password_hash, role, saldo) VALUES (?, ?, ?, "user", 0)',
      [nama, email, hash]
    );
    const user = { id: result.insertId, nama, email, role: 'user' };
    const token = jwt.sign(user, SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (e) {
    res.status(500).json({ error: 'Gagal mendaftar.', detail: e.message });
  }
});

// Masuk
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }
    const u = rows[0];
    const cocok = await bcrypt.compare(password, u.password_hash);
    if (!cocok) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }
    const user = { id: u.id, nama: u.nama, email: u.email, role: u.role };
    const token = jwt.sign(user, SECRET, { expiresIn: '7d' });
    res.json({ token, user, saldo: u.saldo });
  } catch (e) {
    res.status(500).json({ error: 'Gagal login.', detail: e.message });
  }
});

module.exports = router;
