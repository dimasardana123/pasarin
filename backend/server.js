require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Sajikan file frontend statis (index.html & admin.html) dari folder public
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/produk', require('./routes/produk'));
app.use('/api/kategori', require('./routes/kategori'));
app.use('/api/pesanan', require('./routes/pesanan'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Pasarin API berjalan di http://localhost:${PORT}`);
});
