import {
  successResponse,
  errorResponse,
  legacyResponse,
} from "../utils/helpers.js";
import { db } from "../config/database-multi.js";
import { decryptData } from "../utils/decrypt.js";

export class ReferensiController {
  static routes = [
    {
      method: "post",
      path: "/",
      handler: ReferensiController.query,
      auth: ["0", "1", "2", "3", "4"], // All authenticated users
    },
  ];

  static async query(req, res) {
    try {
      const query = req.body.query;
      let decryptedData = decryptData(query).replace(/"/g, "");

      // Decode URL-encoded characters (%20, %2C, etc.)
      decryptedData = decodeURIComponent(decryptedData);

      const resultsQuery = `${decryptedData} `;

      const [results] = await Promise.all([
        db.query(resultsQuery, {
          type: db.QueryTypes.SELECT,
        }),
      ]);

      return legacyResponse(res, results);
    } catch (error) {
      console.error("Error in ReferensiController.query:", error);
      errorResponse(res, "Gagal mengeksekusi query");
    }
  }
}
