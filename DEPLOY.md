# Deployment Guide

**Architecture:**
- `apps/api` → **Railway** (NestJS + WebSocket — serverless olmadığı için Vercel'e gitmez)
- `apps/admin` → **Vercel** (Next.js admin paneli)
- `apps/tv` → **Vercel** (Next.js TV ekranı)

---

## Adım 1 — Railway'de API'yi Deploy Et

### 1.1 Hesap ve Proje Oluştur
1. [railway.app](https://railway.app) → **Start a New Project**
2. **Deploy from GitHub repo** → `restaurantmvppanel` reposunu seç
3. **Root Directory** olarak `apps/api` yaz → **Deploy Now**

### 1.2 PostgreSQL Ekle
1. Railway proje panelinde **+ New** → **Database** → **PostgreSQL**
2. Otomatik olarak `DATABASE_URL` environment variable inject edilir

### 1.3 Redis Ekle
1. **+ New** → **Database** → **Redis**
2. Otomatik olarak `REDIS_URL` environment variable inject edilir

### 1.4 Environment Variables Ekle
Railway → API service → **Variables** sekmesi:

| Key | Value |
|-----|-------|
| `JWT_SECRET` | rastgele uzun bir string (örn. `openssl rand -hex 32` çıktısı) |
| `ALLOWED_ORIGINS` | Vercel deploy sonrası dolduracaksın (şimdilik boş bırak) |

### 1.5 Seed Çalıştır
Railway panelinde API service → **Settings** → **Deploy** → shell aç:
```bash
npm run seed
```
Veya Railway CLI ile:
```bash
railway run --service api npm run seed
```

### 1.6 API URL'ini Kaydet
Railway → API service → **Settings** → **Domains** → Generate Domain  
Not al: `https://XXXX.up.railway.app`

---

## Adım 2 — Vercel'de Admin Panelini Deploy Et

1. [vercel.com](https://vercel.com) → **Add New Project** → GitHub reposunu import et
2. **Root Directory** → `apps/admin` yaz
3. **Environment Variables** ekle:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://XXXX.up.railway.app/api` |
| `NEXT_PUBLIC_WS_URL` | `https://XXXX.up.railway.app` |
| `NEXT_PUBLIC_TV_URL` | *(TV deploy sonrası doldur)* |

4. **Deploy** — URL'ini not al: `https://admin-XXXX.vercel.app`

---

## Adım 3 — Vercel'de TV Ekranını Deploy Et

1. Vercel → **Add New Project** → aynı repoyu tekrar import et
2. **Root Directory** → `apps/tv` yaz
3. **Environment Variables** ekle:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://XXXX.up.railway.app/api` |
| `NEXT_PUBLIC_WS_URL` | `https://XXXX.up.railway.app` |

4. **Deploy** — URL'ini not al: `https://tv-XXXX.vercel.app`

---

## Adım 4 — Son Ayarlar

### Admin'e TV URL'ini ekle
Vercel → Admin project → **Settings** → **Environment Variables**:
- `NEXT_PUBLIC_TV_URL` = `https://tv-XXXX.vercel.app`
- **Redeploy** yap (Settings → Deployments → Redeploy)

### Railway'e CORS ekle
Railway → API service → Variables:
- `ALLOWED_ORIGINS` = `https://admin-XXXX.vercel.app,https://tv-XXXX.vercel.app`
- Otomatik restart olur

---

## Kullanım

1. Admin panel: `https://admin-XXXX.vercel.app`
2. Login: `admin@demo.com` / `admin123`
3. Overview sayfasında TV URL'ini gör
4. TV ekranı: `https://tv-XXXX.vercel.app?restaurantId=RESTAURANT_ID`

---

## Özet Akış

```
GitHub Repo
    ├── apps/api  ──────────────→  Railway  (PostgreSQL + Redis dahil)
    ├── apps/admin  ────────────→  Vercel Project 1
    └── apps/tv  ───────────────→  Vercel Project 2
```

**Toplam maliyet:** Railway Hobby plan ($5/ay) + Vercel ücretsiz tier = ~$5/ay
