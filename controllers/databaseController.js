import { successResponse, errorResponse } from "../utils/helpers.js";
import { getDatabaseStats } from "../utils/database-manager.js";

export class DatabaseController {
  static routes = [
    {
      method: "get",
      path: "/stats",
      handler: DatabaseController.getStats,
      auth: ["0"], // Admin only
    },
    {
      method: "get",
      path: "/info",
      handler: DatabaseController.getInfo,
      auth: ["0"], // Admin only
    },
  ];

  static async getStats(req, res) {
    try {
      const stats = await getDatabaseStats();

      successResponse(
        res,
        {
          statistics: stats,
          timestamp: new Date().toISOString(),
        },
        "Statistik koneksi database"
      );
    } catch (error) {
      console.error("Error in DatabaseController.getStats:", error);
      errorResponse(res, "Gagal mengambil statistik database");
    }
  }

  static async getInfo(req, res) {
    try {
      successResponse(
        res,
        {
          databases: {
            utama: {
              name: process.env.DB_NAME || "v3_next",
              host: process.env.DB_HOST || "localhost",
              port: process.env.DB_PORT || 3306,
              description: "Database utama aplikasi",
            },
            kedua: {
              name: process.env.DB2_NAME || "sintesa_db2",
              host: process.env.DB2_HOST || "localhost",
              port: process.env.DB2_PORT || 3306,
              description: "Database kedua untuk data tambahan",
            },
            ketiga: {
              name: process.env.DB3_NAME || "sintesa_db3",
              host: process.env.DB3_HOST || "localhost",
              port: process.env.DB3_PORT || 3306,
              description: "Database ketiga untuk backup/analisis",
            },
          },
          timestamp: new Date().toISOString(),
        },
        "Informasi database yang tersedia"
      );
    } catch (error) {
      console.error("Error in DatabaseController.getInfo:", error);
      errorResponse(res, "Gagal mengambil informasi database");
    }
  }
}
