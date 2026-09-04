# ⚙️ Khang Backend

> Express + MongoDB + Razorpay REST API for the Khang Chinese Restaurant.
> Deploy to Render in 3 minutes.

---

## 🚀 Deploy to Render (3 min)

### Step 1: Push your code to GitHub

```bash
git add .
git commit -m "ready for render"
git push origin main
```

### Step 2: Create a new Render Web Service

1. Go to **https://dashboard.render.com** → sign in with GitHub
2. Click **New +** → **Web Service**
3. Connect your GitHub repo → select **sulthanhameed/hameed**
4. Configure:

| Setting | Value |
|---|---|
| **Name** | `khang-backend` |
| **Region** | Singapore (or closest to your users) |
| **Branch** | `main` |
| **Root Directory** | `backend` ⚠ IMPORTANT |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node src/server.js` |
| **Plan** | `Free` |

### Step 3: Add Environment Variables

Scroll to **Environment Variables** → click **Add Environment Variable** for each:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `CLIENT_URL` | Your Vercel URL (e.g. `https://khang.vercel.app`) |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Random 32-char string ([generate one](https://randomkeygen.com)) |
| `JWT_EXPIRES_IN` | `7d` |
| `RAZORPAY_KEY_ID` | From Razorpay dashboard (starts with `rzp_test_`) |
| `RAZORPAY_KEY_SECRET` | From Razorpay dashboard |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASS` | Gmail App Password (16 chars, NOT your regular password) |
| `RESTAURANT_EMAIL` | `sultham456@gmail.com` |

### Step 4: Click **Create Web Service**

Wait 2-3 minutes for the build. When done, you'll see logs like:

```
🚀 Khang API running on port 5000
🗄  MongoDB connected → cluster0.xxxxx.mongodb.net/khang
💓 Health check: /health
📚 API root:     /api
```

### Step 5: Copy your Render URL

At the top of the service page, you'll see your URL:
```
https://khang-backend.onrender.com
```

**Save this URL** — you need it for the frontend `VITE_API_URL` env var.

### Step 6: Seed the database

Open **Shell** tab in Render → run:
```bash
node src/scripts/seed.js
```

Output:
```
✓ Inserted 5 categories
✓ Inserted 18 products
✓ Admin created: admin@khang.com / admin123
```

### Step 7: Test the API

Open in browser:
- `https://khang-backend.onrender.com/health` → returns `{"status":"ok"}`
- `https://khang-backend.onrender.com/api/products` → returns all 18 dishes

**✅ Backend is live!**

---

## 🖥 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set up local MongoDB (or use Atlas)
docker run -d --name khang-mongo -p 27017:27017 mongo:7

# 3. Copy env template
cp .env.example .env
# Edit .env with your values

# 4. Seed the database
npm run seed

# 5. Start dev server (with auto-reload)
npm run dev
```

Server runs on `http://localhost:5000`.

---

## 📁 Folder Structure

```
backend/
├── src/
│   ├── server.js              # Express bootstrap + middleware
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/                # Mongoose schemas
│   │   ├── User.js            # Users (with bcrypt password)
│   │   ├── Category.js
│   │   ├── Product.js
│   │   ├── Order.js           # Orders + payment subdoc
│   │   └── Review.js
│   ├── controllers/           # Business logic
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js  # ★ Razorpay HMAC verification
│   │   └── reviewController.js
│   ├── routes/                # Express routers
│   │   ├── index.js
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── payments.js
│   │   └── reviews.js
│   ├── middleware/
│   │   ├── auth.js            # JWT protect + adminOnly
│   │   └── errorHandler.js
│   ├── utils/
│   │   ├── generateToken.js   # JWT signing
│   │   ├── generateOrderId.js # KH-YYYY-XXXX format
│   │   └── notifications.js   # ★ Gmail emails
│   └── scripts/
│       └── seed.js            # Seed menu + admin user
├── package.json               # scripts: start, dev, seed
├── render.yaml                # 1-click Render config
├── Dockerfile
├── .gitignore
├── .env.example
└── README.md
```

---

## 📡 API Endpoints

### Auth (`/api/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/signup` | — | Create account + send welcome email |
| POST | `/login` | — | Login, returns JWT |
| GET | `/me` | ✓ | Get current user |
| PUT | `/me` | ✓ | Update profile |

### Products (`/api/products`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/?category=&q=&featured=&sort=` | — | List/filter/search products |
| GET | `/:slug` | — | Get one product + reviews |
| POST | `/` | admin | Create product |
| PUT | `/:id` | admin | Update product |
| DELETE | `/:id` | admin | Delete product |

### Orders (`/api/orders`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | ✓ | Create order (server recalculates totals) |
| GET | `/me` | ✓ | User's own orders |
| GET | `/:orderId` | ✓ | Get one order |
| GET | `/track/:orderId` | — | Public order tracking |
| GET | `/` | admin | List all orders |
| PUT | `/:id/status` | admin | Update order status |

### Payments (`/api/payments`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/razorpay/create-order` | ✓ | Create Razorpay order (returns SDK params) |
| POST | `/razorpay/verify` | ✓ | Verify HMAC signature → mark paid → send emails |
| POST | `/refund` | admin | Refund a paid order |

### Reviews (`/api/reviews`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/?product=slug&limit=20` | — | List reviews for a product |
| POST | `/` | ✓ | Post a review (1 per user per product) |
| DELETE | `/:id` | ✓ | Delete own review (or admin) |

---

## 💳 Payment Flow (Razorpay)

```
1. Customer clicks "Pay ₹450 Securely →" in frontend
                    ↓
2. Frontend → POST /api/orders
   Backend creates order in MongoDB (status: pending)
                    ↓
3. Frontend → POST /api/payments/razorpay/create-order
   Backend creates Razorpay order via Razorpay SDK
   Returns { key, razorpayOrderId, amount }
                    ↓
4. Frontend loads Razorpay Checkout SDK
   Opens popup with the SDK params
                    ↓
5. Customer pays with card/UPI in Razorpay popup
   Razorpay returns { razorpay_payment_id, razorpay_signature }
                    ↓
6. Frontend → POST /api/payments/razorpay/verify
   Backend computes HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id)
   using RAZORPAY_KEY_SECRET
                    ↓
7. If signatures match:
   • Order marked as "paid" in MongoDB
   • Order confirmation email sent to CUSTOMER
   • Order notification email sent to sultham456@gmail.com ★
   • Response: { orderId, status: "received", paymentStatus: "paid" }
```

---

## 📧 Email Notifications

All emails use Gmail via Nodemailer with an **App Password** (NOT your regular Gmail password).

### When emails are sent:

| Event | Sent to |
|---|---|
| **New user signup** | Customer (welcome) + `sultham456@gmail.com` (notification) |
| **COD order placed** | Customer (confirmation) + `sultham456@gmail.com` (notification) |
| **Razorpay payment verified** | Customer (confirmation) + `sultham456@gmail.com` (notification) |

### Setting up Gmail App Password:

1. Enable 2-Step Verification: https://myaccount.google.com/security
2. Go to: https://myaccount.google.com/apppasswords
3. Select **Mail** → **Other** → name it "Khang Backend"
4. Copy the 16-character password
5. Set as `EMAIL_PASS` in Render env vars

---

## 🐛 Troubleshooting

### "MongoServerError: bad auth"
- Password in `MONGO_URI` is wrong or has special characters
- URL-encode special chars (`@` → `%40`, `#` → `%23`, etc.)

### CORS error in browser console
- `CLIENT_URL` in Render doesn't match your Vercel URL exactly
- Check for trailing slashes or `www.` prefix

### "Razorpay keys missing"
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` env vars not set
- After setting, must click **Save Changes** in Render to redeploy

### "Invalid payment signature"
- `RAZORPAY_KEY_SECRET` has extra spaces or wrong value
- Regenerate keys in Razorpay dashboard if needed

### Emails not sending
- Using regular Gmail password instead of App Password
- 2FA not enabled on the Gmail account
- Check Render logs for "✉ email failed" errors

### Render free tier goes to sleep
- Free tier sleeps after 15 min of inactivity
- Wakes up in ~30 sec on next request
- Upgrade to $7/mo Starter plan for always-on

---

## 🏗 Tech Stack

- **Node.js 20+** (ES modules)
- **Express 4** — REST framework
- **Mongoose 8** — MongoDB ODM
- **bcryptjs** — password hashing (10 rounds)
- **jsonwebtoken** — JWT auth (HS256, 7-day expiry)
- **Razorpay SDK** — payment gateway
- **Nodemailer** — Gmail transactional emails
- **Helmet · CORS · express-rate-limit · Morgan** — security + logging

---

## 📊 What gets deployed

- **60 MB** Node.js Alpine Docker image (if using Docker)
- Uses ~150 MB RAM at idle
- Handles ~300 req/15min per IP (rate limit)
- Auto-scales on Render (with paid plan)
