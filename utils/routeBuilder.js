import express from "express";
import {
  asyncHandler,
  verifikasiToken,
  verifikasiRole,
} from "../middleware/auth.js";

/**
 * Route Builder untuk mempermudah pembuatan routes
 * Penggunaan: cukup definisikan routes dalam controller dengan format standar
 */
export class RouteBuilder {
  constructor() {
    this.router = express.Router();
  }

  /**
   * Setup routes otomatis dari controller
   * @param {Object} controller - Controller class
   * @param {Object} options - Options untuk routes
   */
  setupRoutes(controller, options = {}) {
    const {
      basePath = "",
      middleware = [],
      auth = [], // Default public routes
    } = options;

    // Ambil semua routes dari controller
    const routes = controller.routes || [];

    routes.forEach((route) => {
      this.addRoute({
        ...route,
        basePath,
        middleware: [...middleware, ...(route.middleware || [])],
        auth: route.auth !== undefined ? route.auth : auth,
      });
    });

    return this.router;
  }

  /**
   * Tambah route individual
   */
  addRoute(config) {
    const {
      method = "get",
      path,
      handler,
      auth = [], // Array of roles, empty array = public route
      middleware = [],
    } = config;

    // Build middleware chain
    const middlewareChain = [];

    // Add custom middleware first
    middlewareChain.push(...middleware);

    // Add auth and role verification if roles specified
    if (auth.length > 0) {
      middlewareChain.push(verifikasiToken);
      middlewareChain.push(verifikasiRole(auth));
    }

    // Add async handler
    middlewareChain.push(asyncHandler(handler));

    // Register route
    this.router[method.toLowerCase()](path, ...middlewareChain);
  }

  getRouter() {
    return this.router;
  }
}

/**
 * Auto-discovery routes dari direktori
 */
export const autoDiscoverRoutes = async (routesDir) => {
  // Implementasi auto-discovery akan ditambahkan jika diperlukan
  // Untuk sekarang, kita fokus pada manual setup yang lebih sederhana
};
