# Simplified Backend Structure

## 🚀 Cara Membuat Route Baru (Super Mudah!)

### 1. Buat Controller Baru

```javascript
// controllers/ProductController.js
import { successResponse, errorResponse } from "../utils/helpers.js";
import { db } from "../config/database-multi.js";

export class ProductController {
  // ✅ Cukup definisikan routes di sini - otomatis setup!
  static routes = [
    {
      method: "get",
      path: "/",
      handler: ProductController.getAll,
      adminOnly: false, // Set true untuk admin only
    },
    {
      method: "post",
      path: "/",
      handler: ProductController.create,
      adminOnly: true,
      // Validasi sudah ditangani di frontend
    },
  ];

  // ✅ Implementasikan handlers
  static async getAll(req, res) {
    try {
      // Logic untuk get all products
      successResponse(res, products);
    } catch (error) {
      errorResponse(res, "Gagal mengambil data");
    }
  }

  static async create(req, res) {
    try {
      // Logic untuk create product
      successResponse(res, null, "Product berhasil dibuat", 201);
    } catch (error) {
      errorResponse(res, "Gagal membuat product");
    }
  }
}
```

### 2. Buat Route File

```javascript
// routes/products/products.js
import { createRoutes } from "../../utils/routeHelper.js";
import { ProductController } from "../../controllers/ProductController.js";

// ✅ Cuma 1 baris! Routes otomatis setup dari controller
const router = createRoutes(ProductController);

export default router;
```

### 3. Daftarkan di routes.js

```javascript
// routes/routes.js
import routerProducts from "./products/products.js";

export const setupApiRoutes = (app) => {
  // ... existing routes ...

  // ✅ Tambah 1 baris saja!
  app.use("/next/products", routerProducts);
};
```

## ✨ Selesai! Tidak perlu import banyak middleware atau setup validation manual

---

## 🎯 Keuntungan Struktur Baru

### ✅ Yang Sudah Disederhanakan:

- **Tidak ada validasi backend** - semua validasi ditangani di frontend
- **Auto-setup routes** - cukup definisi di controller
- **Minimal import** - RouteBuilder handle semua middleware
- **Konsisten** - semua controller menggunakan pola yang sama
  ValidationRules.email(); // Required email
  ValidationRules.emailOptional(); // Optional email

// ID validation
ValidationRules.id(); // Required numeric ID

// Pagination
ValidationRules.page(); // Page number
ValidationRules.limit(); // Limit per page

````

## 🔒 Auth & Authorization Options

```javascript
static routes = [
  {
    method: "get",
    path: "/public",
    handler: Controller.publicMethod,
    auth: false,              // ✅ Public route (no auth needed)
  },
  {
    method: "get",
    path: "/user",
    handler: Controller.userMethod,
    auth: true,               // ✅ Need authentication
  },
  {
    method: "post",
    path: "/admin",
    handler: Controller.adminMethod,
    adminOnly: true,          // ✅ Admin only (role "0")
  },
  {
    method: "get",
    path: "/custom",
    handler: Controller.customMethod,
    roles: ["1", "2"],        // ✅ Specific roles only
  },
];
````

## 🎯 Route Definition Complete Example

```javascript
static routes = [
  {
    method: "post",           // HTTP method
    path: "/custom-path",     // Route path
    handler: Controller.method, // Handler function
    auth: true,               // Require authentication
    adminOnly: false,         // Admin only access
    roles: ["1", "2"],        // Specific roles
    validation: [             // Validation rules
      ValidationRules.nama(),
      ValidationRules.email(),
    ],
    middleware: [             // Custom middleware
      customMiddleware1,
      customMiddleware2,
    ],
  },
];
```

## 📝 Template Files

- **Controller Template**: `controllers/_TemplateController.js`
- **Route Template**: Gunakan helper `createRoutes()`

## 🏗️ Struktur Folder Setelah Simplified

```
backend_NEXT/
├── controllers/
│   ├── _TemplateController.js    # Template untuk controller baru
│   ├── authController.js         # ✅ Dengan route definitions
│   ├── userController.js         # ✅ Dengan route definitions
│   └── [NewController.js]        # Controller baru Anda
├── routes/
│   ├── auth/auth.js              # ✅ Hanya 3 baris!
│   ├── users/users.js            # ✅ Hanya 3 baris!
│   ├── [new]/[new].js            # Route baru Anda (3 baris!)
│   └── routes.js                 # Central route config
└── utils/
    ├── routeBuilder.js           # Route builder engine
    └── routeHelper.js            # Helper functions
```

## 🎉 Keuntungan Sistem Baru

1. **Super Simple**: Buat route baru hanya perlu 3 file edit
2. **Centralized**: Semua route logic ada di controller
3. **Auto Validation**: Validation otomatis dari route definition
4. **Auto Auth**: Authentication/authorization otomatis
5. **Consistent**: Semua routes mengikuti pattern yang sama
6. **Easy Maintenance**: Mudah maintain dan debug
7. **Template Ready**: Template siap pakai untuk controller baru

---

**Sekarang membuat route baru hanya perlu:**

1. Copy template controller ➜ Edit routes & handlers
2. Buat route file 3 baris ➜ Import & createRoutes
3. Daftar di routes.js ➜ 1 baris app.use

**DONE! 🎉**
