# Lendom Parfum - E-commerce Website

Website e-commerce untuk toko parfum premium **Lendom Parfum** yang dihosting di GitHub Pages.

## 🌟 Fitur

- ✨ Desain modern dan responsif
- 🛍️ Katalog produk dari database JSON
- 🛒 Keranjang belanja dengan localStorage
- 📱 Checkout otomatis ke WhatsApp
- 🎨 UI premium dengan animasi smooth
- 📦 Filter produk berdasarkan kategori
- 💾 Persistensi keranjang belanja

## 🚀 Demo

Kunjungi: [https://tokoparfum.github.io](https://tokoparfum.github.io)

## 📁 Struktur Proyek

```
tokoparfum.github.io/
├── index.html              # Halaman utama
├── assets/
│   ├── css/
│   │   └── style.css      # Styling
│   ├── js/
│   │   └── app.js         # JavaScript functionality
│   ├── data/
│   │   └── products.json  # Database produk
│   └── images/            # Gambar produk & aset
├── .nojekyll              # GitHub Pages config
├── .gitignore
└── README.md
```

## 🛠️ Teknologi

- HTML5
- CSS3 (Custom Properties, Flexbox, Grid)
- Vanilla JavaScript (ES6+)
- Font Awesome Icons
- Google Fonts (Playfair Display, Inter)

## 📝 Cara Menggunakan

1. Clone repository ini
2. Edit `assets/data/products.json` untuk menambah/mengubah produk
3. Ubah nomor WhatsApp di `assets/js/app.js` (variabel `WHATSAPP_NUMBER`)
4. Deploy ke GitHub Pages

## 🎨 Kustomisasi

### Mengubah Warna

Edit CSS variables di `assets/css/style.css`:

```css
:root {
  --primary-color: #1a1a2e;
  --secondary-color: #d4af37;
  --accent-color: #c9a961;
}
```

### Menambah Produk

Edit file `assets/data/products.json`:

```json
{
  "id": 7,
  "name": "Nama Produk",
  "description": "Deskripsi produk",
  "price": 400000,
  "image": "assets/images/product-7.png",
  "category": "Kategori",
  "stock": true,
  "size": "100ml",
  "notes": ["Note1", "Note2", "Note3"]
}
```

## 📞 Kontak

WhatsApp: +62 896-8704-2904

## 📄 Lisensi

© 2026 Lendom Parfum. All rights reserved.
