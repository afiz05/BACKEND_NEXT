import { verifikasiToken } from "../middleware/auth.js";

// Daftar route yang TIDAK memerlukan autentikasi
const publicRoutes = [
  "POST:/next/auth/login",
  "POST:/next/auth/register",
  "GET:/next/test",
  "GET:/",
  "GET:/favicon.ico",
];

// Daftar route yang memerlukan autentikasi admin
const adminOnlyRoutes = [
  "GET:/next/accounts",
  "GET:/next/database/stats",
  "GET:/next/database/info",
  "GET:/next/users",
  "POST:/next/users",
  "PUT:/next/users/:id",
  "DELETE:/next/users/:id",
  "POST:/next/inquiry",
];

// Middleware untuk cek apakah route memerlukan autentikasi
export const routeAuthChecker = (req, res, next) => {
  const method = req.method;
  const path = req.originalUrl.split("?")[0]; // Remove query params
  const routeKey = `${method}:${path}`;

  // Cek apakah route public
  const isPublicRoute = publicRoutes.some((route) => {
    if (route.includes(":id")) {
      // Handle dynamic routes
      const routePattern = route.replace(":id", "[^/]+");
      const regex = new RegExp(`^${routePattern}$`);
      return regex.test(routeKey);
    }
    return route === routeKey;
  });

  if (isPublicRoute) {
    return next();
  }

  // Semua route lain memerlukan autentikasi
  return verifikasiToken(req, res, next);
};

// Info untuk developer tentang route yang protected
export const getRouteInfo = () => {
  return {
    publicRoutes,
    adminOnlyRoutes,
    note: "Semua route lain memerlukan autentikasi user biasa",
  };
};
