# 🚀 Full Deployment Guide: Frontend (Vercel) + Backend (Render)

Complete step-by-step to deploy Khang Restaurant in ~15 minutes.

---

## 📊 Architecture

```
┌────────────────────┐     ┌────────────────────┐     ┌────────────────────┐
│  Vercel            │────►│  Render.com        │────►│  MongoDB Atlas     │
│  (Frontend)        │HTTPS│  (Backend API)     │TLS  │  (Database)        │
│  React + Vite      │     │  Express + Node    │     │  Free M0 cluster   │
│                    │     │                    │     │                    │
│  hameed.vercel.app │     │  khang-backend     │     │  cluster0.mongo... │
│                    │     │  .onrender.com     │     │                    │
└────────────────────┘     └────────────────────┘     └────────────────────┘
                                     ▲
                                     │ HMAC verify
                                     │
                           ┌────────────────────┐
                           │  Razorpay          │
                           │  (Payments)        │
                           │  Free test mode    │
                           └────────────────────┘

                                     │
                                     │ Nodemailer (Gmail SMTP)
                                     ▼
                           📧 sultham456@gmail.com
                           📧 Customer emails
```

---

## ⏱ Prerequisites (10 min)

Before deploying, get these ready:

### 1. GitHub repo
- Your code pushed to `sulthanhameed/hameed`

### 2. MongoDB Atlas account (free)
- Sign up: https://cloud.mongodb.com/register
- Create a free M0 cluster
- Get connection string: `mongodb+srv://user:PASS@cluster.mongodb.net/khang`
- Whitelist IP: `0.0.0.0/0` in Network Access

### 3. Razorpay account (free test mode)
- Sign up: https://razorpay.com
- Get keys: Dashboard → Settings → API Keys → Generate Test Key
- Save: `Key ID` (rzp_test_...) and `Key Secret`

### 4. Gmail App Password
- Enable 2FA: https://myaccount.google.com/security
- Create App Password: https://myaccount.google.com/apppasswords
- Copy the 16-character password (used as `EMAIL_PASS`)

---

## 🖥 PART 1 — Deploy Backend to Render (5 min)

### Step 1: Push code to GitHub

```bash
git add .
git commit -m "ready to deploy"
git push origin main
```

### Step 2: Create Render Web Service

1. Go to **https://dashboard.render.com** → sign in with GitHub
2. Click **New +** → **Web Service**
3. Click **Connect** on your repo (`sulthanhameed/hameed`)

### Step 3: Configure the service

Fill in **EXACTLY** these values:

| Field | Value |
|---|---|
| **Name** | `khang-backend` |
| **Region** | `Singapore` (closest to India) |
| **Branch** | `main` |
| **Root Directory** | `backend` ⚠ **MUST BE `backend`** |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node src/server.js` |
| **Plan** | `Free` |

### Step 4: Add Environment Variables

Click **Advanced** → scroll to **Environment Variables** → add each:

| Key | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | |
| `PORT` | `5000` | |
| `CLIENT_URL` | `https://khang.vercel.app` | Temporary — update after Vercel deploy |
| `MONGO_URI` | *(your MongoDB Atlas string)* | Full connection URL |
| `JWT_SECRET` | *(random 32+ char string)* | [Generate here](https://randomkeygen.com) |
| `JWT_EXPIRES_IN` | `7d` | |
| `RAZORPAY_KEY_ID` | `rzp_test_XXXX` | From Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | *(your Razorpay secret)* | |
| `EMAIL_USER` | *(your Gmail)* | e.g. `youremail@gmail.com` |
| `EMAIL_PASS` | *(16-char App Password)* | NOT your Gmail password! |
| `RESTAURANT_EMAIL` | `sultham456@gmail.com` | Where order notifications go |

### Step 5: Click **Create Web Service**

Render will now:
- Clone your repo
- Run `npm install` in `backend/` folder
- Start with `node src/server.js`

Wait ~2 min. Watch the logs:

```
==> Cloning from https://github.com/sulthanhameed/hameed
==> Checking out commit XXXX in branch main
==> Running build command: npm install
==> Uploading build...

🚀 Khang API running on port 5000
🗄  MongoDB connected → cluster0.xxxxx.mongodb.net/khang
💓 Health check: /health
📚 API root:     /api
🌐 CORS allowed: https://khang.vercel.app
```

### Step 6: Copy your Render URL

At the top of the service page:
```
https://khang-backend.onrender.com
```

**✅ Save this URL — you need it for Vercel!**

### Step 7: Seed the database

Click **Shell** tab → run:

```bash
node src/scripts/seed.js
```

Output:
```
🌱 Seeding database…
✓ Inserted 5 categories
✓ Inserted 18 products
✓ Admin created: admin@khang.com / admin123
🎉 Done!
```

### Step 8: Test the backend

Open in browser:
- `https://khang-backend.onrender.com/health` → `{"status":"ok"}`
- `https://khang-backend.onrender.com/api/products` → array of 18 dishes

**✅ Backend is LIVE!**

---

## 🎨 PART 2 — Deploy Frontend to Vercel (5 min)

### Step 1: Import repo to Vercel

1. Go to **https://vercel.com/new**
2. Click **Import** on `sulthanhameed/hameed`

### Step 2: Configure

| Field | Value |
|---|---|
| **Framework Preset** | `Vite` (auto-detected) |
| **Root Directory** | *(leave BLANK)* ⚠ NOT `frontend` or `backend`! |
| **Build Command** | *(leave default)* |
| **Output Directory** | *(leave default)* |
| **Install Command** | `npm install --legacy-peer-deps` |

### Step 3: Add Environment Variables

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://khang-backend.onrender.com/api` |
| `NPM_CONFIG_LEGACY_PEER_DEPS` | `true` |
| `NPM_CONFIG_PRODUCTION` | `false` |

⚠ Replace `khang-backend.onrender.com` with **your actual Render URL** from Part 1 Step 6.

### Step 4: Click **Deploy**

Wait ~1 min. When done, note your Vercel URL:
```
https://hameed.vercel.app
```

**✅ Frontend is LIVE!**

---

## 🔄 PART 3 — Connect Frontend ↔ Backend (2 min)

The backend needs to know your Vercel URL for CORS.

### Step 1: Update backend `CLIENT_URL`

1. Go to Render → your `khang-backend` service
2. **Environment** tab
3. Find `CLIENT_URL` → change value from `https://khang.vercel.app` to your **actual Vercel URL** (e.g. `https://hameed.vercel.app`)
4. Click **Save Changes**
5. Render auto-redeploys backend (~1 min)

### Step 2: Test the full flow

Open your Vercel URL and try:

1. **Load menu** → 18 dishes appear ✅
2. **Sign up** → check `sultham456@gmail.com` for "New signup" email ✅
3. **Add items to cart** → cart drawer opens
4. **Checkout** → fill form → click **Pay ₹XXX Securely →**
5. **Razorpay popup** opens (real Razorpay UI)
6. Use test card:
   - Card: `4111 1111 1111 1111`
   - Expiry: `12/26`
   - CVV: `123`
   - OTP: `1234`
7. **Payment succeeds** → success screen with Order ID
8. **Check `sultham456@gmail.com`** → "New Order KH-2026-XXXX" email arrives ✅
9. **Log in as admin** (`admin@khang.com` / `admin123`) → user menu → **⚡ Admin Dashboard** → see the order

---

## ✅ Verification Checklist

After deployment:

- [ ] Render backend health check returns `{"status":"ok"}`
- [ ] Render backend `/api/products` returns 18 products
- [ ] Vercel frontend loads without errors
- [ ] Sign up creates user in MongoDB
- [ ] Welcome email sent to user
- [ ] "New signup" email sent to `sultham456@gmail.com`
- [ ] Login works (JWT stored in localStorage)
- [ ] Cart calculates totals correctly
- [ ] Razorpay popup opens on checkout
- [ ] Test payment succeeds
- [ ] Order confirmation email sent to customer
- [ ] Order notification email sent to `sultham456@gmail.com`
- [ ] Admin dashboard shows the order
- [ ] Order status update works from admin

---

## 🐛 Troubleshooting

### ❌ Vercel build fails: "Failed to resolve /src/main.tsx"
- Check `index.html` uses `/src/main.tsx` (with leading `/`)
- Push latest code and redeploy without cache

### ❌ Render build fails: "Cannot find module"
- Check **Root Directory** is set to `backend` (not blank!)
- Check backend `package.json` has proper `dependencies`

### ❌ Frontend can't reach backend (CORS error in browser console)
- Backend `CLIENT_URL` must EXACTLY match Vercel URL
- No trailing slash: use `https://hameed.vercel.app` NOT `https://hameed.vercel.app/`
- After changing on Render, wait for redeploy (~1 min)

### ❌ "Razorpay keys missing" in backend logs
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` not set on Render
- After adding, click **Save Changes** to redeploy

### ❌ "Invalid payment signature"
- `RAZORPAY_KEY_SECRET` has extra spaces or wrong value
- Copy again from Razorpay dashboard

### ❌ Emails not sending
- Using regular Gmail password instead of App Password
- 2FA not enabled on Gmail account
- Check Render logs for "✉ email failed" messages
- Verify `EMAIL_USER` and `EMAIL_PASS` are set on Render

### ❌ Render free tier goes to sleep
- Free tier sleeps after 15 min of inactivity
- First request wakes it up (~30 sec cold start)
- Upgrade to $7/mo **Starter** plan for always-on

### ❌ MongoDB "Authentication failed"
- Password in `MONGO_URI` doesn't match Atlas user password
- Special characters need URL-encoding (`@` → `%40`, `#` → `%23`)

---

## 🌐 Your Live URLs

| Service | URL |
|---|---|
| **Website** | `https://hameed.vercel.app` |
| **Backend API** | `https://khang-backend.onrender.com` |
| **API Docs** | `https://khang-backend.onrender.com/api` |
| **Health** | `https://khang-backend.onrender.com/health` |
| **MongoDB** | `cluster0.xxxxx.mongodb.net/khang` |

---

## 💰 Costs

| Service | Free Tier | Paid |
|---|---|---|
| **MongoDB Atlas** | 512 MB forever | $9/mo for 2 GB |
| **Render** | Free (sleeps after 15 min) | $7/mo always-on |
| **Vercel** | 100 GB bandwidth/mo | $20/mo Pro |
| **Razorpay** | 2% per transaction | Same |
| **Gmail** | 500 emails/day | Free |

**Total cost to run in production: $0** (with sleep delay) or **$7/mo** for always-on.

---

## 📤 Updating Your Site

Every time you push code to GitHub `main`:
- ✅ Vercel auto-deploys frontend (~1 min)
- ✅ Render auto-deploys backend (~2 min)

```bash
git add .
git commit -m "your changes"
git push origin main
# Both deploy automatically!
```

---

## 🎉 You're Live!

Your restaurant is now open online. Customers can:

- 🍱 Browse the 18-dish menu
- 🛒 Add items to cart
- 💳 Pay with UPI, Card, Wallet via Razorpay
- 📧 Get email confirmations
- 🚚 Track their orders live

You (as owner) receive:
- 📧 Every order at `sultham456@gmail.com`
- 📧 Every signup at `sultham456@gmail.com`
- 💻 Full admin dashboard at your Vercel URL

**Enjoy your live restaurant! 🥟**
