import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { connectDB } from "./config/db.js";
import routes from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();

// ─── Trust proxy (for Render/Vercel/Heroku) ───────────────────
app.set("trust proxy", 1);

// ─── Security ───
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// ─── CORS — allow frontend origin ───
// Multiple origins supported (comma-separated in CLIENT_URL)
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((s) => s.trim())
  : ["http://localhost:5173", "http://localhost:4173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      // Allow all in development
      if (process.env.NODE_ENV !== "production") return callback(null, true);
      // In production, check the whitelist
      if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// ─── Body parsers ───
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ───
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ─── Rate limiting ───
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// ─── Health check (Render uses this) ───
app.get("/health", (_req, res) =>
  res.json({
    status: "ok",
    service: "khang-backend",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }),
);

// ─── Root endpoint ───
app.get("/", (_req, res) =>
  res.json({
    name: "Khang Chinese Restaurant API",
    version: "1.0.0",
    docs: "/api",
    health: "/health",
  }),
);

// ─── API routes ───
app.use("/api", routes);

// ─── 404 + error handler ───
app.use(notFound);
app.use(errorHandler);

// ─── Boot server ───
const PORT = Number(process.env.PORT) || 5000;
const HOST = "0.0.0.0"; // required for Render/Docker

(async () => {
  try {
    await connectDB();
    app.listen(PORT, HOST, () => {
      console.log("");
      console.log(`🚀 Khang API running on port ${PORT}`);
      console.log(`💓 Health check: /health`);
      console.log(`📚 API root:     /api`);
      console.log(`🌐 CORS allowed: ${allowedOrigins.join(", ")}`);
      console.log("");
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
})();

// ─── Graceful error handling ───
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise rejection:", err);
});
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught exception:", err);
  process.exit(1);
});
