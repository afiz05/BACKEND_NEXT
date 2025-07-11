import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import session from "express-session";
import SequelizeStore from "connect-session-sequelize";
import { db } from "./database-multi.js";
import dotenv from "dotenv";

dotenv.config();

// Konfigurasi security middleware
export const konfigurasiSecurity = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  });
};

// Konfigurasi rate limiting
export const konfigurasiRateLimit = () => {
  return rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
      error: "Terlalu banyak permintaan, silakan coba lagi nanti",
      retryAfter: "15 menit",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting untuk IP lokal dalam development
      if (process.env.NODE_ENV === "development") {
        const clientIP = req.ip || req.connection.remoteAddress;
        return clientIP.includes("127.0.0.1") || clientIP.includes("::1");
      }
      return false;
    },
  });
};

// Konfigurasi CORS
export const konfigurasiCors = () => {
  const originsString = process.env.CORS_ORIGINS || "http://localhost:3000";
  const origins = originsString.split(",").map((origin) => origin.trim());

  return cors({
    origin: (origin, callback) => {
      // Izinkan request tanpa origin (mobile apps, dll)
      if (!origin) return callback(null, true);

      if (origins.includes(origin) || process.env.NODE_ENV === "development") {
        callback(null, true);
      } else {
        callback(new Error("Tidak diizinkan oleh CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["X-Total-Count"],
    maxAge: 86400, // 24 hours
  });
};

// Konfigurasi compression
export const konfigurasiCompression = () => {
  return compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  });
};

// Konfigurasi session
export const konfigurasiSession = () => {
  const sessionStore = SequelizeStore(session.Store);
  const store = new sessionStore({
    db,
    checkExpirationInterval: 15 * 60 * 1000, // 15 minutes
    expiration: 24 * 60 * 60 * 1000, // 24 hours
  });

  return session({
    secret: process.env.SESSION_SECRET || "sintesa_session_secret",
    store: store,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    },
    name: "sintesa.sid",
  });
};

// Konfigurasi cookie parser
export const konfigurasiCookieParser = () => {
  return cookieParser(process.env.SESSION_SECRET || "sintesa_session_secret");
};
