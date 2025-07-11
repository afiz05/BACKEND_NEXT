import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { windowsDBOptimization } from "./windows-optimization.js";

dotenv.config();

// Konfigurasi pool database untuk optimasi
const poolConfig =
  process.platform === "win32"
    ? windowsDBOptimization.pool
    : {
        max: 20, // Maximum number of connections in pool
        min: 0, // Minimum number of connections in pool
        acquire: 30000, // Maximum time, in milliseconds, that pool will try to get connection
        idle: 10000, // Maximum time, in milliseconds, that a connection can be idle
        evict: 10000, // Time interval for evicting stale connections
        handleDisconnects: true,
      };

// Konfigurasi dialectOptions untuk MySQL
const dialectOptions =
  process.platform === "win32"
    ? windowsDBOptimization.dialectOptions
    : {
        connectTimeout: 10000,

        dateStrings: true,
        typeCast: true,
      };

// Konfigurasi define default untuk semua model
const defineOptions = {
  timestamps: true,
  underscored: true,
  freezeTableName: true,
  paranoid: true, // Soft deletes
  charset: "utf8mb4",
  collate: "utf8mb4_unicode_ci",
};

// Database Utama
const db = new Sequelize({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || "v3_next",
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  dialect: "mysql",
  logging: false,
  pool: poolConfig,
  timezone: "+07:00",
  dialectOptions,
  define: defineOptions,
});

// Database Kedua
const db2 = new Sequelize({
  host: process.env.DB2_HOST || "localhost",
  port: process.env.DB2_PORT || 3306,
  database: process.env.DB2_NAME || "sintesa_db2",
  username: process.env.DB2_USER || "root",
  password: process.env.DB2_PASSWORD || "",
  dialect: "mysql",
  logging: false,
  pool: poolConfig,
  timezone: "+07:00",
  dialectOptions,
  define: defineOptions,
});

// Database Ketiga
const db3 = new Sequelize({
  host: process.env.DB3_HOST || "localhost",
  port: process.env.DB3_PORT || 3306,
  database: process.env.DB3_NAME || "sintesa_db3",
  username: process.env.DB3_USER || "root",
  password: process.env.DB3_PASSWORD || "",
  dialect: "mysql",
  logging: false,
  pool: poolConfig,
  timezone: "+07:00",
  dialectOptions,
  define: defineOptions,
});

// Test koneksi semua database
const testKoneksiDatabase = async () => {
  const databases = [
    { name: process.env.DB_NAME, connection: db },
    { name: process.env.DB2_NAME, connection: db2 },
    { name: process.env.DB3_NAME, connection: db3 },
  ];

  for (const database of databases) {
    try {
      await database.connection.authenticate();
      console.log(`✅ ${database.name} berhasil terhubung!`);

      // Sync database jika dalam mode development
      if (process.env.NODE_ENV === "development") {
        await database.connection.sync({ alter: false });
        // console.log(`✅ ${database.name} sync berhasil!`);
      }
    } catch (error) {
      console.error(`❌ Error koneksi ${database.name}:`, error.message);
      console.log(`⚠️  ${database.name} tidak tersedia, server tetap berjalan`);
    }
  }
};

// Graceful shutdown untuk semua database
const closeAllDatabases = async () => {
  console.log("\n🔄 Menutup semua koneksi database...");

  const databases = [
    { name: "Database Utama", connection: db },
    { name: "Database Kedua", connection: db2 },
    { name: "Database Ketiga", connection: db3 },
  ];

  for (const database of databases) {
    try {
      await database.connection.close();
      console.log(`✅ ${database.name} ditutup!`);
    } catch (error) {
      console.error(`❌ Error menutup ${database.name}:`, error.message);
    }
  }
};

// Graceful shutdown handler
process.on("SIGINT", async () => {
  await closeAllDatabases();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closeAllDatabases();
  process.exit(0);
});

export { db, db2, db3, testKoneksiDatabase, closeAllDatabases };
