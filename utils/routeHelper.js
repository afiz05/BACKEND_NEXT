import { RouteBuilder } from "../utils/routeBuilder.js";

/**
 * Auto-setup routes dari controller
 * Fungsi helper untuk mempermudah setup routes baru
 */

/**
 * Setup routes dari controller dengan konfigurasi otomatis
 */
export function createRoutes(controller, options = {}) {
  const routeBuilder = new RouteBuilder();
  return routeBuilder.setupRoutes(controller, options);
}

/**
 * Template untuk file route baru
 * Salin template ini untuk membuat route file baru
 */
export const routeTemplate = `
import { createRoutes } from "../../utils/routeHelper.js";
import { YourController } from "../../controllers/YourController.js";

// Setup routes otomatis dari controller
const router = createRoutes(YourController);

export default router;
`;

/**
 * Contoh penggunaan untuk routes dengan opsi custom
 */
export function createRoutesWithOptions(controller, options) {
  /*
  Contoh options:
  {
    basePath: "/api/v1",
    middleware: [customMiddleware],
    auth: true,
    adminOnly: false,
  }
  */
  return createRoutes(controller, options);
}
