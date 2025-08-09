
# Mini E-Commerce (React + Vite + TypeScript)

Özellikler:
- Ürün listeleme (gerçek API veya dev modda MSW)
- Sepete ekle/çıkar, adet güncelle
- Kuponlar: `SAVE10` (%10), `TRY50` (300₺ üzeri 50₺), `FREESHIP` (kargo bedava)
- Admin panel: ürün ekle/düzenle/sil, görsel yükleme (Cloudinary veya backend)
- Giriş (JWT) ve korumalı `/admin` rotası
- React Router, Zustand, TypeScript

## Frontend Kurulum
```bash
npm i
npm run msw   # public içine Service Worker atar (bir kez, API_URL yoksa dev’de kullanılır)
npm run dev
```

## Backend Kurulum
```bash
cd server
cp .env.example .env
npm i
npm run dev  # http://localhost:4000
```

## Frontend'i Backend'e Bağlamak
Proje köküne `.env` koyun:
```env
VITE_API_URL=http://localhost:4000/api
# (Opsiyonel) Cloudinary:
# VITE_CLOUDINARY_CLOUD=your_cloud_name
# VITE_CLOUDINARY_PRESET=your_unsigned_preset
```

Admin giriş: `admin@example.com` / `admin123` (server `.env` ile değiştirin)
