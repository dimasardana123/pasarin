const express = require('express');
const pool = require('../config/db');
const { butuhLogin, butuhAdmin } = require('../config/auth');

const router = express.Router();

// Statistik ringkas untuk dashboard admin
router.get('/statistik', butuhLogin, butuhAdmin, async (req, res) => {
  const [[{ totalProduk }]] = await pool.query('SELECT COUNT(*) AS totalProduk FROM produk');
  const [[{ totalUser }]] = await pool.query("SELECT COUNT(*) AS totalUser FROM users WHERE role='user'");
  const [[{ totalPesanan }]] = await pool.query('SELECT COUNT(*) AS totalPesanan FROM pesanan');
  const [[{ totalPendapatan }]] = await pool.query(
    "SELECT COALESCE(SUM(total),0) AS totalPendapatan FROM pesanan WHERE status='selesai' OR status='dikirim'"
  );
  const [tujuhHari] = await pool.query(`
    SELECT DATE(created_at) AS tanggal, COUNT(*) AS jumlah
    FROM pesanan
    WHERE created_at >= NOW() - INTERVAL 7 DAY
    GROUP BY DATE(created_at)
    ORDER BY tanggal
  `);
  res.json({ totalProduk, totalUser, totalPesanan, totalPendapatan, tujuhHari });
});

// Daftar semua pengguna (admin)
router.get('/users', butuhLogin, butuhAdmin, async (req, res) => {
  const [rows] = await pool.query('SELECT id, nama, email, role, saldo, created_at FROM users ORDER BY id DESC');
  res.json(rows);
});

// Ubah role pengguna (jadikan admin / user biasa)
router.put('/users/:id/role', butuhLogin, butuhAdmin, async (req, res) => {
  const { role } = req.body; // 'admin' | 'user'
  await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
  res.json({ message: 'Role pengguna diperbarui.' });
});

// Tambah saldo pengguna manual (top-up oleh admin)
router.post('/users/:id/saldo', butuhLogin, butuhAdmin, async (req, res) => {
  const { jumlah, keterangan } = req.body;
  await pool.query('UPDATE users SET saldo = saldo + ? WHERE id = ?', [jumlah, req.params.id]);
  await pool.query(
    'INSERT INTO riwayat_saldo (user_id, keterangan, jumlah, tipe) VALUES (?,?,?,"masuk")',
    [req.params.id, keterangan || 'Top-up oleh admin', jumlah]
  );
  res.json({ message: 'Saldo pengguna ditambahkan.' });
});

// Hapus pengguna
router.delete('/users/:id', butuhLogin, butuhAdmin, async (req, res) => {
  await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
  res.json({ message: 'Pengguna dihapus.' });
});

module.exports = router;
