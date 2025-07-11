import { db, db2, db3 } from "../config/database-multi.js";

// Enum untuk database
export const DATABASE_TYPES = {
  UTAMA: "utama",
  KEDUA: "kedua",
  KETIGA: "ketiga",
};

// Mendapatkan instance database berdasarkan type
export const getDatabaseInstance = (type) => {
  switch (type) {
    case DATABASE_TYPES.UTAMA:
      return db;
    case DATABASE_TYPES.KEDUA:
      return db2;
    case DATABASE_TYPES.KETIGA:
      return db3;
    default:
      throw new Error(`Database type tidak valid: ${type}`);
  }
};

// DatabaseManager class untuk script utilities
export class DatabaseManager {
  constructor() {
    this.databases = {
      main: db,
      secondary: db2,
      tertiary: db3,
    };
  }

  async initialize() {
    // Test all database connections
    for (const [name, dbInstance] of Object.entries(this.databases)) {
      try {
        await dbInstance.authenticate();
        console.log(`✅ Database ${name} connected successfully`);
      } catch (error) {
        console.warn(`⚠️  Database ${name} connection failed:`, error.message);
      }
    }
  }

  async query(dbName, sql, replacements = []) {
    const dbInstance = this.databases[dbName];
    if (!dbInstance) {
      throw new Error(`Database ${dbName} not found`);
    }

    try {
      const sqlUpper = sql.trim().toUpperCase();

      // For CREATE, DROP, ALTER operations
      if (
        sqlUpper.startsWith("CREATE") ||
        sqlUpper.startsWith("DROP") ||
        sqlUpper.startsWith("ALTER")
      ) {
        await dbInstance.query(sql, {
          replacements,
          type: dbInstance.QueryTypes.RAW,
        });
        return { success: true };
      }

      // For INSERT operations
      if (sqlUpper.startsWith("INSERT")) {
        const [results, metadata] = await dbInstance.query(sql, {
          replacements,
          type: dbInstance.QueryTypes.INSERT,
        });
        return { insertId: metadata };
      }

      // For UPDATE, DELETE operations
      if (sqlUpper.startsWith("UPDATE") || sqlUpper.startsWith("DELETE")) {
        const [results, metadata] = await dbInstance.query(sql, {
          replacements,
          type: dbInstance.QueryTypes.UPDATE,
        });
        return { affectedRows: metadata };
      }

      // For SELECT operations
      const results = await dbInstance.query(sql, {
        replacements,
        type: dbInstance.QueryTypes.SELECT,
      });
      return results;
    } catch (error) {
      console.error(`Query error on ${dbName}:`, error.message);
      throw error;
    }
  }

  async close() {
    for (const [name, dbInstance] of Object.entries(this.databases)) {
      try {
        await dbInstance.close();
        console.log(`✅ Database ${name} closed`);
      } catch (error) {
        console.error(`Error closing database ${name}:`, error.message);
      }
    }
  }
}

// Wrapper untuk query dengan error handling
export const executeQuery = async (
  query,
  options = {},
  dbType = DATABASE_TYPES.UTAMA
) => {
  try {
    const dbInstance = getDatabaseInstance(dbType);
    const result = await dbInstance.query(query, {
      type: dbInstance.QueryTypes.SELECT,
      ...options,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error(`Error executing query on ${dbType}:`, error);
    return { success: false, error: error.message };
  }
};

// Wrapper untuk transaksi
export const executeTransaction = async (
  callback,
  dbType = DATABASE_TYPES.UTAMA
) => {
  const dbInstance = getDatabaseInstance(dbType);
  const transaction = await dbInstance.transaction();

  try {
    const result = await callback(transaction);
    await transaction.commit();
    return { success: true, data: result };
  } catch (error) {
    await transaction.rollback();
    console.error(`Transaction error on ${dbType}:`, error);
    return { success: false, error: error.message };
  }
};

// Health check untuk semua database
export const checkDatabaseHealth = async () => {
  const healthStatus = {};

  for (const [name, type] of Object.entries(DATABASE_TYPES)) {
    try {
      const dbInstance = getDatabaseInstance(type);
      await dbInstance.authenticate();
      healthStatus[name] = {
        status: "healthy",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      healthStatus[name] = {
        status: "error",
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  return healthStatus;
};

// Fungsi untuk mendapatkan statistik koneksi database
export const getDatabaseStats = async () => {
  const stats = {};

  for (const [name, type] of Object.entries(DATABASE_TYPES)) {
    try {
      const dbInstance = getDatabaseInstance(type);
      const pool = dbInstance.connectionManager.pool;

      stats[name] = {
        used: pool.used || 0,
        available: pool.available || 0,
        pending: pool.pending || 0,
        max: pool.max || 0,
        min: pool.min || 0,
      };
    } catch (error) {
      stats[name] = {
        error: error.message,
      };
    }
  }

  return stats;
};
