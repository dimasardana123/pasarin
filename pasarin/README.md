# Pasarin Marketplace — Admin Panel + Integrasi MySQL

Struktur proyek:

```
pasarin/
├── backend/
│   ├── server.js          # entry point Express API
│   ├── seed.js             # buat akun admin pertama
│   ├── schema.sql          # struktur + data awal database
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   ├── db.js           # koneksi pool MySQL
│   │   └── auth.js         # middleware JWT & cek admin
│   └── routes/
│       ├── auth.js         # register/login
│       ├── produk.js       # CRUD produk
│       ├── kategori.js     # CRUD kategori
│       ├── pesanan.js      # checkout & kelola pesanan
│       └── admin.js        # statistik, kelola pengguna
└── public/
    ├── index.html          # halaman pembeli (file asli kamu)
    └── admin.html          # halaman admin baru
```

## 1. Siapkan database MySQL

```bash
mysql -u root -p < backend/schema.sql
```

Ini akan membuat database `pasarin_db`, semua tabel, dan beberapa data produk contoh.

## 2. Konfigurasi environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` sesuai kredensial MySQL kamu:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=passwordkamu
DB_NAME=pasarin_db
JWT_SECRET=ganti_dengan_kalimat_rahasia_acak
PORT=3000
```

## 3. Install dependency & buat akun admin

```bash
npm install
npm run seed
```

Akun admin default yang dibuat:
- Email: `admin@pasarin.id`
- Password: `admin123`

**Segera ganti password ini setelah login pertama kali** (lewat fitur ubah password yang bisa ditambahkan, atau update manual di database).

## 4. Jalankan server

```bash
npm start
```

Server berjalan di `http://localhost:3000`, dan otomatis menyajikan:
- `http://localhost:3000/index.html` → halaman pembeli
- `http://localhost:3000/admin.html` → panel admin

## Catatan penting tentang integrasi

File `index.html` (versi pembeli) yang kamu upload **masih memakai data simulasi di JavaScript** (array `produkData`, login palsu, dll — sesuai komentar "Ini simulasi, tidak ada data yang benar-benar disimpan ke server" di kode aslinya). Saya sudah menyiapkan seluruh backend + API + database supaya halaman ini bisa terhubung ke MySQL secara nyata, tapi **menyambungkan setiap fungsi JS di index.html ke endpoint API ini adalah pekerjaan terpisah** (mengganti `produkData` dengan `fetch('/api/produk')`, mengganti `prosesDaftar()`/`prosesMasuk()` dengan `fetch('/api/auth/register')`/`login`, dan `selesaikanPembayaran()` dengan `fetch('/api/pesanan')`).

Beri tahu saya kalau kamu mau saya lanjutkan menyambungkan index.html ke API ini juga — supaya pembeli benar-benar belanja dari database yang sama dengan yang dikelola lewat admin.html.

## Daftar endpoint API

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| POST | /api/auth/register | publik | daftar akun |
| POST | /api/auth/login | publik | masuk, dapat token |
| GET | /api/produk | publik | lihat produk aktif |
| GET | /api/produk/admin/semua | admin | lihat semua produk |
| POST | /api/produk | admin | tambah produk |
| PUT | /api/produk/:id | admin | edit produk |
| DELETE | /api/produk/:id | admin | hapus produk |
| GET | /api/kategori | publik | lihat kategori |
| POST/PUT/DELETE | /api/kategori | admin | kelola kategori |
| POST | /api/pesanan | user login | checkout |
| GET | /api/pesanan/saya | user login | riwayat pesanan sendiri |
| GET | /api/pesanan/admin/semua | admin | semua pesanan |
| PUT | /api/pesanan/admin/:id/status | admin | ubah status pesanan |
| GET | /api/admin/statistik | admin | data dashboard |
| GET | /api/admin/users | admin | daftar pengguna |
| PUT | /api/admin/users/:id/role | admin | ubah role |
| POST | /api/admin/users/:id/saldo | admin | top-up saldo |
| DELETE | /api/admin/users/:id | admin | hapus pengguna |

Semua endpoint yang butuh login mengirim header:
```
Authorization: Bearer <token>
```
