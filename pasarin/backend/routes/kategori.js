const express = require('express');
const pool = require('../config/db');
const { butuhLogin, butuhAdmin } = require('../config/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM kategori ORDER BY nama');
  res.json(rows);
});

router.post('/', butuhLogin, butuhAdmin, async (req, res) => {
  try {
    const { nama, icon } = req.body;
    const [result] = await pool.query('INSERT INTO kategori (nama, icon) VALUES (?, ?)', [nama, icon || 'kategori']);
    res.json({ id: result.insertId, message: 'Kategori ditambahkan.' });
  } catch (e) {
    res.status(500).json({ error: 'Gagal menambah kategori.', detail: e.message });
  }
});

router.put('/:id', butuhLogin, butuhAdmin, async (req, res) => {
  const { nama, icon } = req.body;
  await pool.query('UPDATE kategori SET nama=?, icon=? WHERE id=?', [nama, icon, req.params.id]);
  res.json({ message: 'Kategori diperbarui.' });
});

router.delete('/:id', butuhLogin, butuhAdmin, async (req, res) => {
  await pool.query('DELETE FROM kategori WHERE id = ?', [req.params.id]);
  res.json({ message: 'Kategori dihapus.' });
});

module.exports = router;
