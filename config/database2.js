import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Konfigurasi database dengan connection pooling untuk optimasi
const db = new Sequelize({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || "sintesa_db",
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  dialect: "mysql",
  logging: process.env.NODE_ENV === "development" ? console.log : false,

  // Pool konfigurasi untuk mencegah bottleneck
  pool: {
    max: 20, // Maximum number of connections in pool
    min: 0, // Minimum number of connections in pool
    acquire: 30000, // Maximum time, in milliseconds, that pool will try to get connection
    idle: 10000, // Maximum time, in milliseconds, that a connection can be idle
    evict: 10000, // Time interval for evicting stale connections
    handleDisconnects: true,
  },

  // Retry konfigurasi
  retry: {
    max: 3,
    backoffBase: 1000,
    backoffExponent: 2,
  },

  // Timezone
  timezone: "+07:00",

  // Query timeout
  dialectOptions: {
    connectTimeout: 10000,

    timeout: 10000,

    dateStrings: true,
    typeCast: true,
  },

  // Define options
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    paranoid: true, // Soft deletes
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
  },
});

// Test koneksi database
const testKoneksiDatabase = async () => {
  try {
    await db.authenticate();
    console.log("✅ Koneksi database berhasil!");

    // Sync database jika dalam mode development
    if (process.env.NODE_ENV === "development") {
      await db.sync({ alter: false });
      console.log("✅ Database sync berhasil!");
    }
  } catch (error) {
    console.error("❌ Error koneksi database:", error);
    console.log("⚠️  Server akan tetap berjalan tanpa database untuk testing");
    // Tidak exit, lanjutkan tanpa database
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🔄 Menutup koneksi database...");
  await db.close();
  console.log("✅ Koneksi database ditutup!");
  process.exit(0);
});

export { db, testKoneksiDatabase };
