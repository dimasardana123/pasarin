// Jalankan: node seed.js
// Membuat akun admin default: admin@pasarin.id / admin123
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./config/db');

(async () => {
  try {
    const email = 'admin@pasarin.id';
    const password = 'admin123';
    const [exist] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exist.length > 0) {
      console.log('Akun admin sudah ada.');
      process.exit(0);
    }
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (nama, email, password_hash, role, saldo) VALUES (?,?,?,"admin",0)',
      ['Admin Pasarin', email, hash]
    );
    console.log('Akun admin dibuat. Email: admin@pasarin.id | Password: admin123');
    process.exit(0);
  } catch (e) {
    console.error('Gagal membuat admin:', e.message);
    process.exit(1);
  }
})();
