const express = require('express');
const pool = require('../config/db');
const { butuhLogin, butuhAdmin } = require('../config/auth');

const router = express.Router();

// Publik: lihat semua produk aktif
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, k.nama AS kategori
      FROM produk p LEFT JOIN kategori k ON p.kategori_id = k.id
      WHERE p.aktif = 1
      ORDER BY p.id DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Gagal mengambil produk.', detail: e.message });
  }
});

// Admin: lihat semua produk termasuk nonaktif
router.get('/admin/semua', butuhLogin, butuhAdmin, async (req, res) => {
  const [rows] = await pool.query(`
    SELECT p.*, k.nama AS kategori
    FROM produk p LEFT JOIN kategori k ON p.kategori_id = k.id
    ORDER BY p.id DESC
  `);
  res.json(rows);
});

// Admin: tambah produk
router.post('/', butuhLogin, butuhAdmin, async (req, res) => {
  try {
    const { nama, toko, harga, rating, kategori_id, icon, stok } = req.body;
    const [result] = await pool.query(
      `INSERT INTO produk (nama, toko, harga, rating, kategori_id, icon, stok) VALUES (?,?,?,?,?,?,?)`,
      [nama, toko, harga, rating || 5.0, kategori_id || null, icon || 'produk', stok || 0]
    );
    res.json({ id: result.insertId, message: 'Produk ditambahkan.' });
  } catch (e) {
    res.status(500).json({ error: 'Gagal menambah produk.', detail: e.message });
  }
});

// Admin: edit produk
router.put('/:id', butuhLogin, butuhAdmin, async (req, res) => {
  try {
    const { nama, toko, harga, rating, kategori_id, icon, stok, aktif } = req.body;
    await pool.query(
      `UPDATE produk SET nama=?, toko=?, harga=?, rating=?, kategori_id=?, icon=?, stok=?, aktif=? WHERE id=?`,
      [nama, toko, harga, rating, kategori_id || null, icon, stok, aktif, req.params.id]
    );
    res.json({ message: 'Produk diperbarui.' });
  } catch (e) {
    res.status(500).json({ error: 'Gagal memperbarui produk.', detail: e.message });
  }
});

// Admin: hapus produk
router.delete('/:id', butuhLogin, butuhAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM produk WHERE id = ?', [req.params.id]);
    res.json({ message: 'Produk dihapus.' });
  } catch (e) {
    res.status(500).json({ error: 'Gagal menghapus produk.', detail: e.message });
  }
});

module.exports = router;
