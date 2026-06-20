const express = require('express');
const pool = require('../config/db');
const { butuhLogin, butuhAdmin } = require('../config/auth');

const router = express.Router();

// User: buat pesanan baru (checkout)
router.post('/', butuhLogin, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { items, ongkir, metode_bayar } = req.body;
    // items: [{ produk_id, qty }]
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Keranjang kosong.' });
    }

    await conn.beginTransaction();

    const idsProduk = items.map(i => i.produk_id);
    const [produkRows] = await conn.query('SELECT * FROM produk WHERE id IN (?)', [idsProduk]);

    let subtotal = 0;
    const itemSiap = items.map(it => {
      const p = produkRows.find(p => p.id === it.produk_id);
      if (!p) throw new Error('Produk tidak ditemukan: ' + it.produk_id);
      if (p.stok < it.qty) throw new Error(`Stok ${p.nama} tidak cukup.`);
      subtotal += p.harga * it.qty;
      return { ...it, nama: p.nama, harga: p.harga };
    });

    const total = subtotal + (ongkir || 0);

    // Cek & potong saldo jika metode = saldo
    if (metode_bayar === 'saldo') {
      const [[userRow]] = await conn.query('SELECT saldo FROM users WHERE id = ?', [req.user.id]);
      if (userRow.saldo < total) {
        throw new Error('Saldo tidak cukup.');
      }
      await conn.query('UPDATE users SET saldo = saldo - ? WHERE id = ?', [total, req.user.id]);
      await conn.query(
        'INSERT INTO riwayat_saldo (user_id, keterangan, jumlah, tipe) VALUES (?,?,?,"keluar")',
        [req.user.id, `Bayar pesanan`, total]
      );
    }

    const idPesanan = 'PSR-' + Date.now().toString().slice(-8);
    const statusAwal = metode_bayar === 'cod' ? 'diproses' : 'dikirim';

    await conn.query(
      'INSERT INTO pesanan (id, user_id, total, ongkir, metode_bayar, status) VALUES (?,?,?,?,?,?)',
      [idPesanan, req.user.id, total, ongkir || 0, metode_bayar, statusAwal]
    );

    for (const it of itemSiap) {
      await conn.query(
        'INSERT INTO pesanan_item (pesanan_id, produk_id, nama_produk, harga_satuan, qty) VALUES (?,?,?,?,?)',
        [idPesanan, it.produk_id, it.nama, it.harga, it.qty]
      );
      await conn.query('UPDATE produk SET stok = stok - ? WHERE id = ?', [it.qty, it.produk_id]);
    }

    await conn.commit();
    res.json({ id: idPesanan, total, status: statusAwal, message: 'Pesanan berhasil dibuat.' });
  } catch (e) {
    await conn.rollback();
    res.status(400).json({ error: e.message });
  } finally {
    conn.release();
  }
});

// User: lihat riwayat pesanan sendiri
router.get('/saya', butuhLogin, async (req, res) => {
  const [pesananRows] = await pool.query(
    'SELECT * FROM pesanan WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]
  );
  for (const p of pesananRows) {
    const [items] = await pool.query('SELECT * FROM pesanan_item WHERE pesanan_id = ?', [p.id]);
    p.items = items;
  }
  res.json(pesananRows);
});

// Admin: lihat semua pesanan
router.get('/admin/semua', butuhLogin, butuhAdmin, async (req, res) => {
  const [rows] = await pool.query(`
    SELECT pe.*, u.nama AS nama_pembeli, u.email AS email_pembeli
    FROM pesanan pe JOIN users u ON pe.user_id = u.id
    ORDER BY pe.created_at DESC
  `);
  res.json(rows);
});

// Admin: ubah status pesanan
router.put('/admin/:id/status', butuhLogin, butuhAdmin, async (req, res) => {
  try {
    const { status } = req.body; // diproses | dikirim | selesai
    await pool.query('UPDATE pesanan SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Status pesanan diperbarui.' });
  } catch (e) {
    res.status(500).json({ error: 'Gagal memperbarui status.', detail: e.message });
  }
});

module.exports = router;
