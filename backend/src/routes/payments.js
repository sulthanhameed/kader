import { Router } from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  refundOrder,
} from "../controllers/paymentController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

// ─── Razorpay ─────────────────────────────────────────────
// 1. Create Razorpay order (returns SDK params)
router.post("/razorpay/create-order", protect, createRazorpayOrder);

// 2. Verify signature after payment (marks order as paid + sends emails)
router.post("/razorpay/verify", protect, verifyRazorpayPayment);

// ─── Admin: refund ────────────────────────────────────────
router.post("/refund", protect, adminOnly, refundOrder);

export default router;
