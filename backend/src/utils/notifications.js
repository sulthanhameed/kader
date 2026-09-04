import nodemailer from "nodemailer";

let transporter;

/**
 * Lazily create the Nodemailer transporter.
 * Uses Gmail with an App Password (EMAIL_USER + EMAIL_PASS).
 */
function getTransport() {
  if (transporter) return transporter;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("⚠  Email not configured (EMAIL_USER/EMAIL_PASS missing)");
    return null;
  }
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter;
}

/**
 * Send order confirmation to the CUSTOMER
 * and a copy to the RESTAURANT (sultham456@gmail.com).
 */
export async function sendOrderEmail(order) {
  const t = getTransport();
  if (!t) return;

  const itemsHtml = order.items
    .map(
      (i) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #eee;">
            <strong>${i.name}</strong>
            ${i.chineseName ? `<br/><span style="font-family:serif;color:#15803d;font-size:12px">${i.chineseName}</span>` : ""}
          </td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:center">× ${i.qty}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;font-weight:600">₹${i.price * i.qty}</td>
        </tr>`,
    )
    .join("");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#0a0a0a;background:#fff">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#15803d,#064e2e);color:#fff;padding:32px 24px;text-align:center">
        <div style="font-size:36px;font-weight:bold;font-family:serif;margin:0">康 Khang</div>
        <p style="margin:8px 0 0;opacity:.9;letter-spacing:2px;text-transform:uppercase;font-size:11px">
          Chinese Restaurant &amp; Dimsum
        </p>
      </div>

      <!-- Body -->
      <div style="padding:32px 24px;background:#fff">
        <h1 style="margin:0 0 12px;font-size:22px">Order Confirmed! 🥟</h1>
        <p style="margin:0 0 8px">Hi ${order.customer?.name || "friend"},</p>
        <p style="margin:0 0 24px;color:#52525b;line-height:1.6">
          Thank you for your order. Our chefs are already preparing your meal.
          Estimated delivery time: <strong>30–40 minutes</strong>.
        </p>

        <div style="background:#f4f4f5;padding:20px;border-radius:12px;margin:20px 0;border-left:4px solid #15803d">
          <div style="font-family:monospace;font-size:11px;letter-spacing:2px;color:#71717a;text-transform:uppercase">Order ID</div>
          <div style="font-family:monospace;font-size:20px;font-weight:bold;color:#15803d;margin-top:4px">${order.orderId}</div>
        </div>

        <!-- Items -->
        <h3 style="margin:24px 0 8px;font-size:14px;text-transform:uppercase;letter-spacing:2px;color:#71717a">
          Your Order
        </h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
          <tbody>${itemsHtml}</tbody>
        </table>

        <!-- Totals -->
        <table style="width:100%;border-collapse:collapse;background:#fafafa;padding:12px;border-radius:8px">
          <tr>
            <td style="padding:6px 10px;color:#52525b">Subtotal</td>
            <td style="padding:6px 10px;text-align:right">₹${order.subtotal}</td>
          </tr>
          <tr>
            <td style="padding:6px 10px;color:#52525b">Tax (5%)</td>
            <td style="padding:6px 10px;text-align:right">₹${order.tax}</td>
          </tr>
          <tr>
            <td style="padding:6px 10px;color:#52525b">Delivery</td>
            <td style="padding:6px 10px;text-align:right">${order.delivery === 0 ? "FREE" : "₹" + order.delivery}</td>
          </tr>
          <tr style="border-top:2px solid #0a0a0a">
            <td style="padding:12px 10px;font-weight:bold;font-size:16px">Total</td>
            <td style="padding:12px 10px;text-align:right;font-weight:bold;font-size:20px;color:#15803d">₹${order.total}</td>
          </tr>
        </table>

        <!-- Delivery address -->
        ${
          order.address?.line1
            ? `
        <div style="margin:24px 0;padding:16px;background:#f9fafb;border-radius:8px">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#71717a;margin-bottom:6px">Delivering to</div>
          <div>${order.address.line1}</div>
          ${order.address.city ? `<div>${order.address.city} ${order.address.pincode || ""}</div>` : ""}
          <div style="margin-top:8px;font-size:13px;color:#52525b">📞 ${order.customer?.phone || ""}</div>
        </div>`
            : ""
        }

        <!-- Payment -->
        <div style="margin:20px 0;padding:12px 16px;background:${order.payment?.status === "paid" ? "#dcfce7" : "#fef3c7"};border-radius:8px;font-size:13px">
          Payment: <strong style="text-transform:uppercase">${order.payment?.method || "N/A"}</strong>
          — Status: <strong style="text-transform:uppercase;color:${order.payment?.status === "paid" ? "#166534" : "#92400e"}">${order.payment?.status || "pending"}</strong>
        </div>

        <p style="margin:24px 0 8px;color:#52525b;font-size:13px">
          Track your order live at:
          <a href="${process.env.CLIENT_URL || "https://khang.vercel.app"}" style="color:#15803d">${process.env.CLIENT_URL || "khang.vercel.app"}</a>
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#0a0a0a;color:#a1a1aa;padding:24px;text-align:center;font-size:12px">
        <div style="font-family:serif;color:#22c55e;font-size:20px">康</div>
        <p style="margin:8px 0 0">Khang Chinese Restaurant &amp; Dimsum</p>
        <p style="margin:4px 0 0;opacity:.7">Lane 7, Koregaon Park, Pune · +91 98765 43210</p>
      </div>
    </div>
  `;

  // ─── 1. Send to CUSTOMER ───────────────────
  if (order.customer?.email) {
    try {
      await t.sendMail({
        from: `"Khang Restaurant" <${process.env.EMAIL_USER}>`,
        to: order.customer.email,
        subject: `Order ${order.orderId} confirmed · Khang Restaurant`,
        html,
      });
      console.log(`✉  Customer email → ${order.customer.email}`);
    } catch (err) {
      console.error("✉  Customer email failed:", err.message);
    }
  }

  // ─── 2. Send a COPY to the RESTAURANT ──────
  const restaurantEmail = process.env.RESTAURANT_EMAIL || "sultham456@gmail.com";
  try {
    await t.sendMail({
      from: `"Khang Orders" <${process.env.EMAIL_USER}>`,
      to: restaurantEmail,
      subject: `🍽 NEW ORDER · ${order.orderId} · ₹${order.total}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto">
          <div style="background:#15803d;color:#fff;padding:16px;border-radius:8px 8px 0 0">
            <h2 style="margin:0">🔔 New Order Received</h2>
            <div style="font-family:monospace;margin-top:4px">${order.orderId}</div>
          </div>
          <div style="background:#fff;padding:20px;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 8px 8px">
            <p><strong>Customer:</strong> ${order.customer?.name || "N/A"}</p>
            <p><strong>Phone:</strong> ${order.customer?.phone || "N/A"}</p>
            <p><strong>Email:</strong> ${order.customer?.email || "N/A"}</p>
            <p><strong>Total:</strong> <span style="color:#15803d;font-size:20px;font-weight:bold">₹${order.total}</span></p>
            <p><strong>Payment:</strong> ${order.payment?.method?.toUpperCase()} — <span style="color:${order.payment?.status === "paid" ? "#166534" : "#92400e"};font-weight:bold">${order.payment?.status?.toUpperCase()}</span></p>
            <hr style="margin:16px 0;border:none;border-top:1px solid #e4e4e7"/>
            ${html.match(/<table[\s\S]*?<\/table>/)?.[0] || ""}
            ${
              order.address?.line1
                ? `<p style="margin-top:16px"><strong>Address:</strong><br/>${order.address.line1}<br/>${order.address.city || ""} ${order.address.pincode || ""}</p>`
                : ""
            }
          </div>
        </div>
      `,
    });
    console.log(`✉  Restaurant email → ${restaurantEmail}`);
  } catch (err) {
    console.error("✉  Restaurant email failed:", err.message);
  }
}

/**
 * Send SMS (optional — requires Twilio setup).
 */
export async function sendOrderSMS(order) {
  if (!process.env.TWILIO_ACCOUNT_SID) return;
  if (!order.customer?.phone) return;

  try {
    const { default: twilio } = await import("twilio");
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
    await client.messages.create({
      body: `Khang: Order ${order.orderId} confirmed! Total ₹${order.total}. Arriving in 30-40 min. Track at ${process.env.CLIENT_URL || "khang.vercel.app"}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: order.customer.phone,
    });
    console.log(`📱 SMS → ${order.customer.phone}`);
  } catch (err) {
    console.error("📱 SMS failed:", err.message);
  }
}

/**
 * Send welcome email on signup.
 * Also notifies the restaurant that a new user registered.
 */
export async function sendWelcomeEmail(user) {
  const t = getTransport();
  if (!t) return;

  const restaurantEmail = process.env.RESTAURANT_EMAIL || "sultham456@gmail.com";

  // Notify restaurant of new signup
  try {
    await t.sendMail({
      from: `"Khang Signup" <${process.env.EMAIL_USER}>`,
      to: restaurantEmail,
      subject: `👤 New user signup · ${user.name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px">
          <h2 style="color:#15803d">🎉 New User Registered</h2>
          <p><strong>Name:</strong> ${user.name}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Phone:</strong> ${user.phone || "Not provided"}</p>
          <p><strong>Registered at:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `,
    });
    console.log(`✉  New signup notification → ${restaurantEmail}`);
  } catch (err) {
    console.error("✉  Signup notification failed:", err.message);
  }

  // Welcome email to user
  if (user.email) {
    try {
      await t.sendMail({
        from: `"Khang Restaurant" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `Welcome to Khang, ${user.name}! 🥟`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:linear-gradient(135deg,#15803d,#064e2e);color:#fff;padding:32px;text-align:center">
              <div style="font-family:serif;font-size:40px">康 Khang</div>
              <p style="margin:8px 0 0;letter-spacing:2px;font-size:11px;text-transform:uppercase">Welcome!</p>
            </div>
            <div style="padding:32px;background:#fff">
              <h2>Hi ${user.name}, welcome to Khang! 🎉</h2>
              <p style="color:#52525b;line-height:1.6">
                Thank you for joining our family. Your account is ready — you can now:
              </p>
              <ul style="color:#52525b;line-height:2">
                <li>🛒 Order authentic Chinese food faster</li>
                <li>🚚 Track your orders in real-time</li>
                <li>❤️ Save your favourite dishes</li>
                <li>💰 Get exclusive member discounts</li>
              </ul>
              <a href="${process.env.CLIENT_URL || "https://khang.vercel.app"}"
                 style="display:inline-block;background:#15803d;color:#fff;padding:12px 24px;border-radius:9999px;text-decoration:none;margin-top:16px;font-weight:bold">
                Start Ordering →
              </a>
            </div>
          </div>
        `,
      });
      console.log(`✉  Welcome email → ${user.email}`);
    } catch (err) {
      console.error("✉  Welcome email failed:", err.message);
    }
  }
}
