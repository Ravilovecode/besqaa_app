# Besqaa — Scan · Source · Supply

Expo / React Native mobile app for **besqaa.in** (buyers): browse the catalog, cart & checkout
(COD or UPI with payment-proof verification), Besqaa Query sourcing requests, buyback tracking.

The platform is split across three repos:

| Part | Stack | Repo | Runs on |
|------|-------|------|---------|
| 📱 **Mobile app** (this repo) | Expo / React Native (Expo Router) | `besqaa_app` | iOS / Android / Web |
| ⚙️ **Backend API** | Node + Express + MongoDB + AWS S3 | `besqaa_backend` | http://localhost:5000 |
| 🧑‍💼 **Admin panel** | React + Vite | `besqaa_admin` | http://localhost:5173 |

The admin creates **categories** → lists **products** into them → they appear in
the app **instantly**. Buyers browse, add to cart, checkout, and submit
**Besqaa Queries** (a sourcing-request form that replaces the old barcode scanner).

---

## Prerequisites

- **Node.js 18+** (tested on 20)
- **MongoDB** — either:
  - a local install (`mongodb://127.0.0.1:27017`), or
  - a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (paste its URI)
- **AWS S3 bucket** + IAM keys (for product image uploads) — optional until you upload images

---

## 1) Backend (`besqaa_backend` repo)

```bash
git clone <besqaa_backend repo> && cd besqaa_backend
npm install
cp .env.example .env          # then edit .env (see below)
npm run seed                  # creates the admin + demo catalog
npm run dev                   # starts http://localhost:5000
```

**`.env` keys that matter:**

```
MONGO_URI=mongodb://127.0.0.1:27017/besqaa      # or your Atlas URI
JWT_SECRET=<a long random string>
SEED_ADMIN_EMAIL=admin@besqaa.in                # bootstrap admin login
SEED_ADMIN_PASSWORD=Admin@12345
# AWS S3 — required only to upload product images:
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=besqaa-product-images
```

> `npm run seed` prints the admin credentials and inserts demo categories/products
> so the app shows content immediately.

**Run the automated end-to-end test** (uses an in-memory MongoDB, no setup):

```bash
node smoke-test.mjs
```

## 2) Admin panel (`besqaa_admin` repo)

```bash
git clone <besqaa_admin repo> && cd besqaa_admin
npm install
cp .env.example .env          # VITE_API_URL=http://localhost:5000/api
npm run dev                   # http://localhost:5173
```

Log in with the seeded admin. Then:
1. **Categories → New category** (e.g. *Televisions*)
2. **Products → List product**, pick the category, upload photos (→ S3), save
3. The product is now live in the app. Manage **Orders** and **Besqaa Queries** from the sidebar.

## 3) Mobile app (this repo)

```bash
npm install                   # already done if you cloned fresh
npx expo start
```

Set the API URL the app should call. Defaults work for simulators; for a **physical
phone** create a `.env` at the repo root:

```
EXPO_PUBLIC_API_URL=http://<your-computer-LAN-IP>:5000/api
```

| Where the app runs | Default API host |
|--------------------|------------------|
| iOS simulator / web | `http://localhost:5000/api` |
| Android emulator | `http://10.0.2.2:5000/api` |
| Physical phone (Expo Go) | set `EXPO_PUBLIC_API_URL` to your LAN IP |

---

## App flow

`Splash → Sign in / Sign up → Tabs`

**Tabs:** Home · Products · **Besqaa Query** (center) · Cart · Profile
Plus: Product details, Checkout, Order placed, My Orders, Saved.

## API overview

| Method | Route | Who |
|--------|-------|-----|
| POST | `/api/auth/register`, `/api/auth/login` | Buyers |
| POST | `/api/admin/auth/login` | Admin (separate) |
| GET | `/api/categories`, `/api/products` | Public (app) |
| POST/PUT/DELETE | `/api/categories`, `/api/products` | Admin |
| POST | `/api/upload` | Admin (S3) |
| GET/POST/PUT/DELETE | `/api/cart/*` | Buyer |
| POST/GET | `/api/orders` | Buyer |
| GET/PUT | `/api/admin/orders`, `/api/admin/queries` | Admin |
| POST | `/api/queries` | Buyer / guest (Besqaa Query) |
```
