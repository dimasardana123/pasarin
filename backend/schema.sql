-- ====================================================
-- Pasarin Marketplace — Database Schema (MySQL)
-- ====================================================
CREATE DATABASE IF NOT EXISTS pasarin_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE pasarin_db;

-- ===== USERS (pembeli & admin) =====
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  saldo BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== KATEGORI =====
CREATE TABLE IF NOT EXISTS kategori (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50) DEFAULT 'kategori'
);

-- ===== PRODUK =====
CREATE TABLE IF NOT EXISTS produk (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(200) NOT NULL,
  toko VARCHAR(150) NOT NULL,
  harga BIGINT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 5.0,
  kategori_id INT,
  icon VARCHAR(50) DEFAULT 'produk',
  stok INT NOT NULL DEFAULT 0,
  aktif TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kategori_id) REFERENCES kategori(id) ON DELETE SET NULL
);

-- ===== PESANAN =====
CREATE TABLE IF NOT EXISTS pesanan (
  id VARCHAR(30) PRIMARY KEY,           -- contoh: PSR-1001
  user_id INT NOT NULL,
  total BIGINT NOT NULL,
  ongkir BIGINT NOT NULL DEFAULT 0,
  metode_bayar ENUM('saldo','transfer','ewallet','cod') NOT NULL,
  status ENUM('diproses','dikirim','selesai') NOT NULL DEFAULT 'diproses',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===== ITEM PESANAN =====
CREATE TABLE IF NOT EXISTS pesanan_item (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pesanan_id VARCHAR(30) NOT NULL,
  produk_id INT,
  nama_produk VARCHAR(200) NOT NULL,    -- snapshot nama saat dibeli
  harga_satuan BIGINT NOT NULL,
  qty INT NOT NULL,
  FOREIGN KEY (pesanan_id) REFERENCES pesanan(id) ON DELETE CASCADE,
  FOREIGN KEY (produk_id) REFERENCES produk(id) ON DELETE SET NULL
);

-- ===== RIWAYAT SALDO =====
CREATE TABLE IF NOT EXISTS riwayat_saldo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  keterangan VARCHAR(200) NOT NULL,
  jumlah BIGINT NOT NULL,
  tipe ENUM('masuk','keluar') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===== SEED DATA =====
INSERT INTO kategori (nama, icon) VALUES
  ('Sayur','sayur'), ('Buah','buah'), ('Minuman','kopi'),
  ('Roti','roti'), ('Bunga','bunga'), ('Kerajinan','kerajinan'), ('Tas','tas')
ON DUPLICATE KEY UPDATE nama = nama;

INSERT INTO produk (nama, toko, harga, rating, kategori_id, icon, stok) VALUES
  ('Sayur bayam segar','Tani Makmur',8000,4.8,1,'sayur',50),
  ('Jeruk manis 1kg','Kebun Pak Slamet',22000,4.7,2,'buah',40),
  ('Kopi robusta 250g','Kedai Seduh',35000,4.9,3,'kopi',30),
  ('Roti gandum isi 6','Roti Bunda',18000,4.6,4,'roti',25),
  ('Rangkaian bunga mawar','Toko Bunga Asri',65000,4.9,5,'bunga',15),
  ('Tas anyam rotan','Kerajinan Lasem',95000,4.8,6,'kerajinan',10),
  ('Tomat segar 1kg','Tani Makmur',10000,4.5,1,'sayur',45),
  ('Tas selempang kanvas','Karya Lokal',78000,4.7,7,'tas',20);

-- Admin default — email: admin@pasarin.id / password: admin123
-- (password_hash diisi otomatis oleh script seed.js, jangan diisi manual di sini)
