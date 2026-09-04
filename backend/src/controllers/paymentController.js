import crypto from "crypto";
import Razorpay from "razorpay";
import Order from "../models/Order.js";
import { sendOrderEmail, sendOrderSMS } from "../utils/notifications.js";

// ─── Lazy Razorpay client ─────────────────────────────────
let razorpay;
function getRazorpay() {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error(
        "Razorpay keys missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env",
      );
    }
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
}

// ═════════════════════════════════════════════════════════════
// RAZORPAY PAYMENT FLOW
// ═════════════════════════════════════════════════════════════

/**
 * POST /api/payments/razorpay/create-order
 * Body: { orderId } — internal Khang order id (e.g. KH-2026-0042)
 *
 * Creates a Razorpay order and returns the SDK params the frontend
 * needs to open the Razorpay Checkout popup.
 */
export async function createRazorpayOrder(req, res, next) {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.payment.status === "paid") {
      return res.status(400).json({ message: "Order already paid" });
    }

    const rp = getRazorpay();
    const rpOrder = await rp.orders.create({
      amount: order.total * 100, // Razorpay expects paise
      currency: "INR",
      receipt: order.orderId,
      notes: {
        khangOrderId: order.orderId,
        userId: String(order.user),
        customerName: order.customer?.name || "",
        customerEmail: order.customer?.email || "",
      },
    });

    // Save Razorpay order ID
    order.payment.razorpayOrderId = rpOrder.id;
    order.payment.gateway = "razorpay";
    await order.save();

    res.json({
      key: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      orderId: order.orderId,
      customer: order.customer,
    });
  } catch (err) {
    console.error("Razorpay create-order failed:", err);
    next(err);
  }
}

/**
 * POST /api/payments/razorpay/verify
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }
 *
 * Verifies the HMAC-SHA256 signature returned by Razorpay after payment.
 * On success: marks order as paid + sends emails (customer + restaurant).
 */
export async function verifyRazorpayPayment(req, res, next) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // Recompute the expected signature
    const signaturePayload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(signaturePayload)
      .digest("hex");

    // Compare signatures
    if (expectedSignature !== razorpay_signature) {
      console.warn("⚠  Signature mismatch for order:", orderId);
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Signature valid — update order
    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.payment.razorpayPaymentId = razorpay_payment_id;
    order.payment.razorpaySignature = razorpay_signature;
    order.payment.status = "paid";
    order.payment.paidAt = new Date();
    await order.save();

    console.log(`✅ Payment verified for order ${orderId}`);

    // Fire-and-forget notifications (don't block response)
    sendOrderEmail(order).catch((err) =>
      console.error("Email failed:", err.message),
    );
    sendOrderSMS(order).catch((err) =>
      console.error("SMS failed:", err.message),
    );

    res.json({
      message: "Payment verified successfully",
      order: {
        orderId: order.orderId,
        status: order.status,
        total: order.total,
        paymentStatus: order.payment.status,
      },
    });
  } catch (err) {
    console.error("Razorpay verify failed:", err);
    next(err);
  }
}

/**
 * POST /api/payments/refund
 * Body: { orderId }
 * Admin-only. Refunds a paid Razorpay order.
 */
export async function refundOrder(req, res, next) {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.payment.status !== "paid") {
      return res.status(400).json({ message: "Order is not paid" });
    }

    if (order.payment.gateway === "razorpay") {
      const rp = getRazorpay();
      await rp.payments.refund(order.payment.razorpayPaymentId, {
        amount: order.total * 100,
      });
    }

    order.payment.status = "refunded";
    order.status = "cancelled";
    order.tracking.push({
      stage: "cancelled",
      note: "Order refunded by admin",
      at: new Date(),
    });
    await order.save();

    res.json({ message: "Refund processed", order });
  } catch (err) {
    console.error("Refund failed:", err);
    next(err);
  }
}
