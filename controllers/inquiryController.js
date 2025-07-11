import {
  successResponse,
  errorResponse,
  legacyResponse,
  inquiryResponse,
} from "../utils/helpers.js";
import { db } from "../config/database-multi.js";
import { decryptData } from "../utils/decrypt.js";

export class InquiryController {
  static routes = [
    {
      method: "post",
      path: "/",
      handler: InquiryController.query,
      auth: ["0", "1", "2", "3", "4"], // All authenticated users
    },
  ];

  static async query(req, res) {
    try {
      const query = req.body.sql;

      let decryptedData = decryptData(query).replace(/"/g, "");

      // Decode URL-encoded characters (%20, %2C, etc.)
      decryptedData = decodeURIComponent(decryptedData);

      const resultsQuery = `${decryptedData} `;
      console.log("Executing query:", resultsQuery);

      const [results] = await Promise.all([
        db.query(resultsQuery, {
          type: db.QueryTypes.SELECT,
        }),
      ]);

      return inquiryResponse(res, results);
    } catch (error) {
      const errorMessage = error.original
        ? error.original.sqlMessage
        : "Terjadi kesalahan dalam memproses permintaan.";
      res.status(500).json({ error: errorMessage });
    }
  }
}
