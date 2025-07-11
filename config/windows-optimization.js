import cluster from "cluster";
import os from "os";

// Konfigurasi optimasi untuk Windows production
export const konfigurasiWindows = {
  // Setup thread pool untuk Windows
  setupThreadPool: () => {
    const numCPUs = os.cpus().length;
    const threadPoolSize = Math.max(4, numCPUs * 2);
    process.env.UV_THREADPOOL_SIZE = threadPoolSize.toString();

    console.log(`🔧 Thread pool size: ${threadPoolSize}`);
    console.log(`💻 CPU cores: ${numCPUs}`);
    console.log(`🖥️  Platform: ${process.platform}`);
    console.log(`🏗️  Architecture: ${process.arch}`);
  },

  // Optimasi memory untuk Windows
  setupMemoryOptimization: () => {
    // Garbage collection optimization
    if (process.env.NODE_ENV === "production") {
      process.env.NODE_OPTIONS =
        (process.env.NODE_OPTIONS || "") +
        " --max-old-space-size=4096" +
        " --optimize-for-size" +
        " --gc-interval=100";
    }

    // Memory monitoring
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const memPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

      if (memPercent > 85) {
        console.warn(`⚠️  Memory usage tinggi: ${memPercent.toFixed(2)}%`);

        // Force garbage collection jika tersedia
        if (global.gc) {
          global.gc();
          console.log("🔄 Garbage collection dipaksa");
        }
      }
    }, 30000); // Check setiap 30 detik
  },

  // Optimasi untuk Windows file system
  setupFileSystemOptimization: () => {
    // Increase file watchers limit untuk Windows
    process.env.CHOKIDAR_USEPOLLING = "false";
    process.env.CHOKIDAR_INTERVAL = "1000";

    // Optimasi untuk Windows path
    process.env.FORCE_COLOR = "1";
    process.env.NPM_CONFIG_PROGRESS = "false";
  },

  // Performance monitoring untuk Windows
  setupPerformanceMonitoring: () => {
    const startTime = Date.now();

    setInterval(() => {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      console.log(
        `📊 Performance Stats [Worker ${process.env.WORKER_ID || 0}]:`
      );
      console.log(
        `   Memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`
      );
      console.log(`   Uptime: ${Math.round((Date.now() - startTime) / 1000)}s`);
      console.log(`   CPU User: ${Math.round(cpuUsage.user / 1000)}ms`);
      console.log(`   CPU System: ${Math.round(cpuUsage.system / 1000)}ms`);
    }, 300000); // Log setiap 5 menit
  },

  // Windows-specific error handling
  setupWindowsErrorHandling: () => {
    // Handle Windows-specific errors
    process.on("uncaughtException", (err) => {
      console.error("❌ Uncaught Exception (Windows):", err);

      // Log error detail untuk Windows debugging
      if (err.code === "EACCES") {
        console.error("🔒 Permission denied - periksa hak akses file");
      } else if (err.code === "ENOENT") {
        console.error("📁 File/directory tidak ditemukan");
      } else if (err.code === "EADDRINUSE") {
        console.error("🔌 Port sudah digunakan");
      }

      // Graceful shutdown
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("❌ Unhandled Rejection (Windows):", reason);
      console.error("Promise:", promise);
    });
  },
};

// Optimasi database connection pool untuk Windows
export const windowsDBOptimization = {
  pool: {
    max: 15, // Lebih konservatif untuk Windows
    min: 2,
    acquire: 60000, // Timeout lebih panjang
    idle: 20000,
    evict: 15000,
    handleDisconnects: true,
  },

  dialectOptions: {
    connectTimeout: 30000, // 30 seconds untuk Windows

    timeout: 30000,
  },
};

export default konfigurasiWindows;
