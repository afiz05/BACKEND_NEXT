import { successResponse, errorResponse } from "../utils/helpers.js";

export class CekOfflineController {
  static routes = [
    {
      method: "get",
      path: "/",
      handler: CekOfflineController.getStatus,
      auth: [], // Public route
    },
  ];

  static async getStatus(req, res) {
    try {
      const status = {
        status: "OK",
        timestamp: new Date().toISOString(),
      };

      successResponse(res, status, "Data Status Berhasil Diambil");
    } catch (error) {
      console.error("Error in CekOfflineController.getStatus:", error);
      errorResponse(res, "Gagal mengambil status");
    }
  }
}
