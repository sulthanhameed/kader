# 🎨 Khang Frontend

> React 19 + Vite + TypeScript + Tailwind CSS v4
> Deploys to Vercel in 2 minutes.

---

## 📁 Structure Note

**The active source code is at the repository ROOT** (`/src/`, `/index.html`, `/package.json`, `/vite.config.ts`).

This `frontend/` folder contains:
- `package.json` — matches root config (for reference)
- `vite.config.ts` — matches root config
- `tsconfig.json` — matches root config
- `index.html` — matches root file
- `vercel.json` — deployment config
- `.env.example`, `.npmrc`, `.nvmrc`, `.gitignore` — env setup

**When deploying to Vercel, set Root Directory = BLANK** (or `./`).
Vercel will use the actual source files at the repo root.

---

## 🚀 Deploy to Vercel (3 min)

### Step 1: Push your code to GitHub

```bash
git add .
git commit -m "ready to deploy"
git push origin main
```

### Step 2: Create Vercel Project

1. Go to **https://vercel.com/new**
2. Click **Import** on your GitHub repo (`sulthanhameed/hameed`)

### Step 3: Configure

| Field | Value |
|---|---|
| **Framework Preset** | `Vite` (auto-detected) |
| **Root Directory** | *(leave BLANK)* ⚠ IMPORTANT |
| **Build Command** | `npm run build` (auto-detected) |
| **Output Directory** | `dist` (auto-detected) |
| **Install Command** | `npm install --legacy-peer-deps` |

### Step 4: Environment Variables

Add these before deploying:

| Key | Value |
|---|---|
| `VITE_API_URL` | Your Render backend URL + `/api` (e.g. `https://khang-backend.onrender.com/api`) |
| `NPM_CONFIG_LEGACY_PEER_DEPS` | `true` |
| `NPM_CONFIG_PRODUCTION` | `false` |

### Step 5: Click **Deploy**

Wait ~1 min. Your site is live at `https://yourproject.vercel.app`.

---

## 🖥 Local Development

From the **repository root** (not this folder):

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Copy env template
cp .env.example .env
# Edit .env — set VITE_API_URL

# 3. Start dev server
npm run dev
```

Opens at `http://localhost:5173`.

---

## 📁 Source Code Location

All actual source files are at repository root:

```
/                       ← repo root (where Vite builds)
├── index.html          ← Vite entry
├── package.json
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── main.tsx        ← React root
    ├── App.tsx         ← Main app + all providers
    ├── index.css       ← Tailwind v4 + custom styles
    ├── components/     ← 22 React components
    ├── context/        ← Auth + Cart contexts
    ├── lib/            ← API client + payment orchestrator
    ├── data/           ← Menu data
    └── utils/          ← Helper functions
```

---

## 🔌 Connecting to Backend

The frontend calls the backend via `src/lib/api.ts` which reads `VITE_API_URL`:

```ts
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
```

**Payment flow** (`src/lib/payments.ts` + `src/lib/razorpay.ts`):
1. User clicks "Pay ₹XXX" → `runCheckout()` is called
2. Frontend creates order via `POST /api/orders`
3. Frontend requests Razorpay params via `POST /api/payments/razorpay/create-order`
4. Frontend opens Razorpay Checkout popup
5. On success, calls `POST /api/payments/razorpay/verify` for HMAC signature verification
6. Backend sends email confirmations to customer + `sultham456@gmail.com`

---

## 🎯 Features

- **Interactive Hero** — 5 signature dishes with click-to-swap
- **Editorial Menu** — 18 dishes with category filter, sort
- **Cart Drawer** — auto totals, free delivery > ₹500
- **Auth System** — Sign in/up with JWT + localStorage
- **Real Razorpay Checkout** — HMAC-verified payments
- **Order Tracking** — 4-stage live progress
- **Admin Dashboard** — order management + revenue stats
- **Global Search** — Cmd-K style command palette
- **Chef's Surprise** — random dish spinner
- **Mobile-First Design** — dark ink editorial style

---

## 📦 Build Output

```
✓ 60 modules transformed
✓ dist/index.html                     1.18 kB
✓ dist/assets/index.css               77.91 kB  → 12.21 kB gzipped
✓ dist/assets/index.js                309.12 kB → 86.44 kB gzipped
✓ dist/assets/api.js + payments.js    ~3 kB     (code-split)
✓ Built in ~1.7s
✓ Total gzipped: ~99 KB
```

---

## 🛠 Tech Stack

- **React 19.2** + TypeScript 5.9
- **Vite 7** — dev server + build
- **Tailwind CSS v4** — utility-first styling with `@theme` tokens
- **Custom fonts** — Playfair Display, Outfit, Manrope, Space Grotesk, Ma Shan Zheng
- **No external animation library** — all animations are CSS + IntersectionObserver

## 📚 See Also

- `../backend/README.md` — Backend API + Render deployment
- `../DEPLOYMENT.md` — Complete deployment guide
- `../README.md` — Project overview
