# 🏮 Khang Chinese Restaurant & Dimsum

> Full-stack food ordering platform with real payment integration.
>
> **Frontend** → React + Vite (deploy to Vercel)
> **Backend** → Express + MongoDB (deploy to Render)
> **Database** → MongoDB Atlas
> **Payments** → Razorpay

---

## 📁 Project Structure

```
khang/
│
├── 🎨 frontend/               ← Frontend configs (Vercel deploy target)
│   ├── package.json           ← "build": "vite build"
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── vercel.json            ← Vercel deployment config
│   ├── .env.example
│   ├── .npmrc, .nvmrc, .gitignore
│   └── README.md              ← Frontend deployment guide
│
├── ⚙️  backend/                ← Backend API (Render deploy target)
│   ├── src/
│   │   ├── server.js          ← Express bootstrap
│   │   ├── config/db.js       ← MongoDB connection
│   │   ├── models/            ← Mongoose schemas
│   │   ├── controllers/       ← Business logic
│   │   ├── routes/            ← REST endpoints
│   │   ├── middleware/        ← JWT auth + error handler
│   │   ├── utils/             ← Email + JWT helpers
│   │   └── scripts/seed.js    ← Populate menu + admin user
│   ├── package.json           ← "start": "node src/server.js"
│   ├── render.yaml            ← 1-click Render deploy
│   ├── Dockerfile
│   ├── .env.example
│   └── README.md              ← Backend deployment guide
│
├── 🗄  database/               ← MongoDB schemas + seed data
│   ├── schema/                ← JSON Schema for each collection
│   ├── seed/                  ← 5 categories + 18 dishes + admin
│   ├── migrations/            ← Index creation script
│   ├── scripts/               ← Backup + restore helpers
│   ├── docs/                  ← ER diagram + indexes
│   └── README.md
│
├── 📄 src/                    ← FRONTEND SOURCE CODE ★
│   ├── main.tsx               ← React entry
│   ├── App.tsx                ← Main app with all providers
│   ├── index.css              ← Tailwind v4 + custom styles
│   ├── components/            ← 22 React components
│   ├── context/               ← Auth + Cart contexts
│   ├── lib/                   ← API client + Razorpay integration
│   ├── data/                  ← Menu data
│   └── utils/                 ← Helpers
│
├── 📄 package.json            ← Root frontend config
├── 📄 vite.config.ts          ← Root Vite config
├── 📄 tsconfig.json           ← Root TypeScript config
├── 📄 index.html              ← Root Vite entry
├── 📄 vercel.json             ← Root Vercel config
│
├── 🐳 docker-compose.yml      ← Full-stack local dev
├── 📖 DEPLOYMENT.md           ← Complete step-by-step guide
└── 📖 README.md               ← This file
```

> **Why `src/` is at root:** Vite's build tool needs `index.html`, `package.json`,
> and `src/` in the same directory. The `frontend/` folder mirrors the same
> config files for reference and deployment documentation.

---

## 🚀 Quick Deploy (15 min)

### Prerequisites (all free)
1. **MongoDB Atlas** — https://cloud.mongodb.com (free M0 cluster)
2. **Razorpay** — https://razorpay.com (free test mode)
3. **Gmail App Password** — https://myaccount.google.com/apppasswords

### Deploy in 3 parts:

#### Part 1 — Backend to Render (5 min)
- Go to https://dashboard.render.com → **New Web Service**
- Connect repo → **Root Directory: `backend`**
- Add env vars (MongoDB, Razorpay, Email, etc.)
- Deploy

#### Part 2 — Frontend to Vercel (5 min)
- Go to https://vercel.com/new → import repo
- Framework: **Vite** (auto-detected)
- **Root Directory: BLANK** (uses root files)
- Add env var: `VITE_API_URL` = your Render URL + `/api`
- Deploy

#### Part 3 — Connect them (2 min)
- Go back to Render → update `CLIENT_URL` env var to your Vercel URL
- Save → auto-redeploys

**See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for detailed step-by-step guide.**

---

## ✨ Features

### 🎨 Frontend
- **Interactive Hero** — click dishes to swap into center position
- **Editorial Menu** — 18 dishes with category filter, sort, search
- **Cart Drawer** — auto totals, 5% tax, free delivery > ₹500
- **Auth System** — Sign in/up with JWT + localStorage
- **Real Razorpay Checkout** — HMAC-verified payments (test cards work)
- **Order Tracking** — 4-stage live progress
- **Admin Dashboard** — order management + revenue stats
- **Global Search** — Cmd-K command palette
- **Chef's Surprise** — random dish spinner
- **Responsive** — mobile-first design

### ⚙️ Backend
- **JWT Auth** — bcrypt password hashing + role-based access
- **20+ REST endpoints** — auth, products, orders, payments, reviews
- **Real Razorpay integration** — HMAC-SHA256 signature verification
- **Server-side price recalculation** — never trusts client prices
- **Email confirmations** via Nodemailer (Gmail SMTP)
- **Order tracking events** stored per order
- **Rate limiting** (300 req / 15min) + Helmet + CORS
- **MongoDB** with 5 collections + text search + indexes

### 🗄 Database
- **users** — email unique, bcrypt password, addresses, favourites
- **products** — 18 dishes with Chinese names, ratings, spice
- **orders** — items snapshot, payment subdoc, tracking events
- **categories** — 5 pre-seeded
- **reviews** — 1 per user per product

### 💳 Payment Integration (Real, not simulated)
- **Razorpay** — UPI, Cards, Wallets, Netbanking
- **HMAC verification** — every payment cryptographically verified
- **Order emails** dispatched to customer + `sultham456@gmail.com`
- **Refund support** for admins

### 📧 Email Notifications
Every order + signup triggers **two emails**:
- ✉ Customer email — order/welcome confirmation
- ✉ **sultham456@gmail.com** — restaurant notification

---

## 🖥 Local Development

### Option A — Docker Compose (1 command)

```bash
# Fill in backend/.env with your keys first
docker compose up
```

Runs:
- MongoDB on `:27017`
- Backend on `:5000` (auto-seeded)
- Frontend on `:5173`

### Option B — Manual setup

```bash
# 1. Start MongoDB
docker run -d --name khang-mongo -p 27017:27017 mongo:7

# 2. Backend (Terminal 1)
cd backend
cp .env.example .env    # fill in your keys
npm install
npm run seed
npm run dev             # http://localhost:5000

# 3. Frontend (Terminal 2, from root)
cd ..
cp .env.example .env    # set VITE_API_URL
npm install --legacy-peer-deps
npm run dev             # http://localhost:5173
```

Sign in as **admin@khang.com** / **admin123** for admin dashboard.

---

## 🎯 Payment Flow (End-to-End)

```
1. User clicks "Pay ₹450 Securely →"
                ↓
2. Frontend: POST /api/orders
   Backend creates order in MongoDB (status: pending)
                ↓
3. Frontend: POST /api/payments/razorpay/create-order
   Backend uses Razorpay SDK to create RP order
   Returns { key, razorpayOrderId, amount, customer }
                ↓
4. Frontend loads Razorpay Checkout SDK
   Opens popup with returned params
                ↓
5. User pays with test card 4111 1111 1111 1111 (OTP: 1234)
   Razorpay returns { razorpay_payment_id, razorpay_signature }
                ↓
6. Frontend: POST /api/payments/razorpay/verify
   Backend computes HMAC-SHA256(order_id + "|" + payment_id)
   using RAZORPAY_KEY_SECRET
                ↓
7. If signatures match:
   ✅ Order marked "paid" in MongoDB
   ✅ Email sent to customer
   ✅ Email sent to sultham456@gmail.com
   ✅ Frontend shows success screen with Order ID
```

---

## 📖 Documentation

| File | Purpose |
|---|---|
| **`README.md`** (this file) | Project overview |
| **`DEPLOYMENT.md`** | Step-by-step Vercel + Render deployment |
| **`backend/README.md`** | Backend API docs + Render setup |
| **`frontend/README.md`** | Frontend architecture notes |
| **`database/README.md`** | MongoDB schema docs + ER diagram |

---

## 🛠 Tech Stack

**Frontend:** React 19 · TypeScript · Vite · Tailwind CSS v4

**Backend:** Node.js 20 · Express 4 · Mongoose 8 · bcrypt · JWT · Razorpay SDK · Nodemailer

**Database:** MongoDB 7 · Text indexes · Compound indexes

**Deploy:** Vercel (frontend) · Render (backend) · MongoDB Atlas (database)

---

## 💰 Costs

| Service | Free Tier | Paid |
|---|---|---|
| MongoDB Atlas | 512 MB forever | $9/mo for 2 GB |
| Render | Free (sleeps after 15 min) | $7/mo always-on |
| Vercel | 100 GB bandwidth/mo | $20/mo Pro |
| Razorpay | 2% per transaction | Same |
| Gmail | 500 emails/day | Free |

**Total: $0 to run in production** (with sleep delay) or **$7/mo** always-on.

---

## 📜 License

MIT — free to use as a starting point for your own restaurant.

---

<div align="center">

`康` · *Crafted with patience tastes of love.* · `福`

Made with 🥟 for Khang Restaurant

</div>
