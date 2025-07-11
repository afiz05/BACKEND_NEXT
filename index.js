import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Import konfigurasi
import { db, db2, db3, testKoneksiDatabase } from "./config/database-multi.js";
import {
  konfigurasiSecurity,
  konfigurasiRateLimit,
  konfigurasiCors,
  konfigurasiCompression,
  konfigurasiSession,
  konfigurasiCookieParser,
} from "./config/middleware.js";

// Import Windows optimization
import { konfigurasiWindows } from "./config/windows-optimization.js";

// Import socket handler
import { inisialisasiSocket } from "./socket/socketHandler.js";

// Import middleware
import { errorHandler, logAktivitas } from "./middleware/auth.js";

// Import routes configuration
import { setupApiRoutes } from "./routes/index.js";

// Load environment variables
dotenv.config();

// Apply Windows optimizations if running on Windows
if (process.platform === "win32") {
  windowsOptimization();
  windowsErrorHandling();
  memoryMonitoring();
  performanceMonitoring();
}

// Dapatkan __dirname untuk ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SintesaServer {
  constructor() {
    this.app = express();
    this.server = null;
    this.socketServer = null;
    this.port = process.env.PORT || 8080;

    this.initializeServer();
  }

  async initializeServer() {
    try {
      // Setup Windows optimization jika di Windows
      if (process.platform === "win32") {
        console.log("🪟 Applying Windows optimizations...");
        konfigurasiWindows.setupThreadPool();
        konfigurasiWindows.setupMemoryOptimization();
        konfigurasiWindows.setupFileSystemOptimization();
        konfigurasiWindows.setupPerformanceMonitoring();
        konfigurasiWindows.setupWindowsErrorHandling();
      }

      // Test koneksi database
      await testKoneksiDatabase();

      // Setup middleware
      this.setupMiddleware();

      // Setup routes
      this.setupRoutes();

      // Setup error handling
      this.setupErrorHandling();

      // Create HTTP server
      this.createServer();

      // Setup socket
      this.setupSocket();

      // Start server
      this.startServer();

      // Setup graceful shutdown
      this.setupGracefulShutdown();
    } catch (error) {
      console.error("❌ Error inisialisasi server:", error);
      process.exit(1);
    }
  }

  setupMiddleware() {
    console.log("🔧 Setup middleware...");

    // Disable powered by express
    this.app.disable("x-powered-by");

    // Trust proxy untuk mendapatkan IP yang benar
    this.app.set("trust proxy", 1);

    // Security middleware
    this.app.use(konfigurasiSecurity());

    // Rate limiting
    this.app.use(konfigurasiRateLimit());

    // CORS
    this.app.use(konfigurasiCors());

    // Compression
    this.app.use(konfigurasiCompression());

    // Session
    this.app.use(konfigurasiSession());

    // Cookie parser
    this.app.use(konfigurasiCookieParser());

    // Body parser
    this.app.use(
      express.json({
        limit: "10mb",
        strict: true,
        type: "application/json",
      })
    );

    this.app.use(
      express.urlencoded({
        extended: true,
        limit: "10mb",
        parameterLimit: 20,
      })
    );

    // Static files
    this.app.use(
      "/public",
      express.static(path.join(__dirname, "public"), {
        maxAge: "1d",
        etag: true,
        lastModified: true,
      })
    );

    // Request logging
    if (process.env.NODE_ENV === "development") {
      this.app.use(logAktivitas);
    }

    console.log("✅ Middleware setup selesai");
  }

  setupRoutes() {
    console.log("🛣️  Setup routes...");

    // Setup all API routes using external configuration
    setupApiRoutes(this.app);

    console.log("✅ Routes setup selesai");
  }

  setupErrorHandling() {
    console.log("🛡️  Setup error handling...");

    // Global error handler (harus di akhir)
    this.app.use(errorHandler);

    // Unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      console.error("❌ Unhandled Promise Rejection:", err);
      this.gracefulShutdown();
    });

    // Uncaught exceptions
    process.on("uncaughtException", (err) => {
      console.error("❌ Uncaught Exception:", err);
      this.gracefulShutdown();
    });

    console.log("✅ Error handling setup selesai");
  }

  createServer() {
    console.log("🚀 Creating HTTP server...");

    // Create HTTP server
    this.server = http.createServer(this.app);

    // Server timeout configuration
    this.server.timeout = 30000; // 30 seconds
    this.server.keepAliveTimeout = 5000; // 5 seconds
    this.server.headersTimeout = 6000; // 6 seconds

    console.log("✅ HTTP server created");
  }

  setupSocket() {
    console.log("🔌 Setup socket...");

    // Get CORS options
    const corsOptions = {
      origin: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    };

    // Initialize socket server
    this.socketServer = inisialisasiSocket(this.server, corsOptions);

    console.log("✅ Socket setup selesai");
  }

  startServer() {
    this.server.listen(this.port, () => {
      console.log("\n🎉 ==============================");
      console.log(`🚀 Server berjalan di port ${this.port}`);
      console.log(`🌐 URL: http://localhost:${this.port}`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📊 Database: ${process.env.DB_NAME || "sintesa_db"}`);
      console.log(`🔌 Socket.IO: Aktif`);
      console.log("🎉 ==============================\n");
    });

    // Handle server errors
    this.server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${this.port} sudah digunakan`);
        process.exit(1);
      } else {
        console.error("❌ Server error:", error);
        process.exit(1);
      }
    });
  }

  setupGracefulShutdown() {
    // Graceful shutdown handlers
    const signals = ["SIGTERM", "SIGINT", "SIGUSR2"];

    signals.forEach((signal) => {
      process.on(signal, () => {
        console.log(`\n📨 Received ${signal}, shutting down gracefully...`);
        this.gracefulShutdown();
      });
    });
  }

  async gracefulShutdown() {
    console.log("🔄 Graceful shutdown dimulai...");

    // Stop accepting new connections
    if (this.server) {
      this.server.close(() => {
        console.log("✅ HTTP server ditutup");
      });
    }

    // Close socket server
    if (this.socketServer) {
      this.socketServer.close(() => {
        console.log("✅ Socket server ditutup");
      });
    }

    // Close database connection
    try {
      await db.close();
      console.log("✅ Database connection ditutup");
    } catch (error) {
      console.error("❌ Error closing database:", error);
    }

    // Exit process
    setTimeout(() => {
      console.log("👋 Proses dihentikan");
      process.exit(0);
    }, 1000);
  }
}

// Start server
const server = new SintesaServer();

// Export untuk testing
export default server;
