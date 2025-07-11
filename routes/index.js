import express from "express";
import { asyncHandler, verifikasiToken } from "../middleware/auth.js";
import { successResponse, errorResponse } from "../utils/helpers.js";
import { createRoutes } from "../utils/routeHelper.js";

// Import all controllers
import { AuthController } from "../controllers/authController.js";
import { UserController } from "../controllers/userController.js";
import { SocketController } from "../controllers/socketController.js";
import { DatabaseController } from "../controllers/databaseController.js";
import { CekOfflineController } from "../controllers/cekOfflineController.js";
import { ReferensiController } from "../controllers/referensiController.js";
import { AdkController } from "../controllers/adkController.js";
import { InquiryController } from "../controllers/inquiryController.js";

const router = express.Router();

// Route untuk testing API (public)
router.get(
  "/test",
  asyncHandler(async (req, res) => {
    successResponse(
      res,
      { message: "API berjalan dengan baik" },
      "Test berhasil"
    );
  })
);

// Route untuk melihat info autentikasi routes (dengan autentikasi admin)
router.get(
  "/auth-info",
  verifikasiToken,
  asyncHandler(async (req, res) => {
    const { getRouteInfo } = await import("../middleware/routeAuth.js");
    const routeInfo = getRouteInfo();

    successResponse(
      res,
      {
        ...routeInfo,
        currentUser: {
          userId: req.user.userId,
          role: req.user.role,
          username: req.user.username,
        },
      },
      "Informasi autentikasi routes"
    );
  })
);

// Route untuk informasi API (dengan autentikasi)
router.get(
  "/info",
  verifikasiToken,
  asyncHandler(async (req, res) => {
    const apiInfo = {
      name: "Sintesa Backend API",
      version: "1.0.0",
      description:
        "Backend API untuk aplikasi Sintesa dengan dukungan multi-database",
      author: "DJPB",
      databases: {
        count: 3,
        types: ["Database Utama", "Database Kedua", "Database Ketiga"],
      },
      endpoints: {
        auth: "/api/auth",
        users: "/api/users",
        data: "/api/data",
        socket: "/socket.io",
      },
      documentation: "/api/docs",
    };

    successResponse(res, apiInfo, "Informasi API");
  })
);

// Setup API routes function
export const setupApiRoutes = (app) => {
  console.log("🛣️  Setting up API routes...");

  // Setup routes from controllers
  const authRoutes = createRoutes(AuthController);
  const userRoutes = createRoutes(UserController);
  const socketRoutes = createRoutes(SocketController);
  const databaseRoutes = createRoutes(DatabaseController);
  const cekOfflineRoutes = createRoutes(CekOfflineController);
  const referensiRoutes = createRoutes(ReferensiController);
  const adkRoutes = createRoutes(AdkController);
  const inquiryRoutes = createRoutes(InquiryController);

  // Mount API routes
  app.use("/next", router);
  app.use("/next/auth", authRoutes);
  app.use("/next/users", userRoutes);
  app.use("/next/socket", socketRoutes);
  app.use("/next/database", databaseRoutes);
  app.use("/next/status", cekOfflineRoutes);
  app.use("/next/adk", adkRoutes);
  app.use("/next/referensi", referensiRoutes);
  app.use("/next/inquiry", inquiryRoutes);

  // Root route
  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "Sintesa Backend API",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: "/next/auth",
        users: "/next/users",
        socket: "/next/socket",
        database: "/next/database",
        status: "/next/status",
        adk: "/next/adk",
        referensi: "/next/referensi",
      },
    });
  });

  // 404 handler
  app.use("*", (req, res) => {
    res.status(404).json({
      success: false,
      message: "Endpoint tidak ditemukan",
      path: req.originalUrl,
    });
  });

  console.log("✅ API routes setup selesai");
};

export default router;
