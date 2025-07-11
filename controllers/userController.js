import bcrypt from "bcrypt";
import { successResponse, errorResponse } from "../utils/helpers.js";
import { db } from "../config/database-multi.js";
import { decryptData } from "../utils/decrypt.js";

export class UserController {
  // Route definitions - tinggal definisikan di sini untuk auto-setup
  static routes = [
    {
      method: "get",
      path: "/",
      handler: UserController.getAllUsers,
      auth: ["0"], // Admin only
    },
    {
      method: "get",
      path: "/:id",
      handler: UserController.getUserById,
      auth: ["0"], // Admin only
    },
    {
      method: "post",
      path: "/",
      handler: UserController.legacyQuery,
      auth: ["0", "1", "2", "3", "4"], // All authenticated users
    },
    {
      method: "post",
      path: "/rekam",
      handler: UserController.rekamUser,
      auth: ["0"], // Admin only
    },
    {
      method: "put",
      path: "/:id",
      handler: UserController.updateUser,
      auth: ["0"], // Admin only
    },
    {
      method: "delete",
      path: "/:id",
      handler: UserController.deleteUser,
      auth: ["0"], // Admin only
    },
  ];

  // Get all users with pagination
  static async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      const query = `
        SELECT id, username, name, email, role, kdkanwil, kdkppn, kdlokasi, active, createdAt, updatedAt 
        FROM users 
        ORDER BY createdAt DESC 
        LIMIT ${limit} OFFSET ${offset}
      `;

      const users = await db.query(query, {
        type: db.QueryTypes.SELECT,
      });

      // Get total count for pagination
      const countQuery = "SELECT COUNT(*) as total FROM users";
      const [{ total }] = await db.query(countQuery, {
        type: db.QueryTypes.SELECT,
      });

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        totalPages: Math.ceil(total / limit),
      };

      successResponse(
        res,
        { users, pagination },
        "Data users berhasil diambil"
      );
    } catch (error) {
      console.error("Error getting users:", error);
      errorResponse(res, "Gagal mengambil data users", 500);
    }
  }

  // Get user by ID
  static async getUserById(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT id, username, name, email, role, kdkanwil, kdkppn, kdlokasi, active, createdAt, updatedAt 
        FROM users 
        WHERE id = :id
      `;

      const users = await db.query(query, {
        replacements: { id },
        type: db.QueryTypes.SELECT,
      });

      if (!users || users.length === 0) {
        return errorResponse(res, "User tidak ditemukan", 404);
      }

      successResponse(res, users[0], "Data user berhasil diambil");
    } catch (error) {
      console.error("Error getting user by ID:", error);
      errorResponse(res, "Gagal mengambil data user", 500);
    }
  }

  // Create new user
  static async rekamUser(req, res) {
    try {
      const {
        username,
        password,
        nama,
        role,
        active,
        kdkanwil,
        kdkppn,
        kdlokasi,
      } = req.body;

      // Validation
      if (!username || !password || !nama || !role) {
        return errorResponse(
          res,
          "Field username, password, nama, dan role harus diisi",
          400
        );
      }

      // Check if username already exists
      const checkUserQuery =
        "SELECT username FROM users WHERE username = :username";
      const existingUser = await db.query(checkUserQuery, {
        replacements: { username },
        type: db.QueryTypes.SELECT,
      });

      if (existingUser.length > 0) {
        return errorResponse(res, "Username sudah digunakan", 400);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      const insertQuery = `
        INSERT INTO users (username, password, name, role, active, kdkanwil, kdkppn, kdlokasi, createdAt, updatedAt)
        VALUES (:username, :password, :name, :role, :active, :kdkanwil, :kdkppn, :kdlokasi, NOW(), NOW())
      `;

      await db.query(insertQuery, {
        replacements: {
          username,
          password: hashedPassword,
          name: nama,
          role,
          active: active ? "1" : "0",
          kdkanwil: kdkanwil || null,
          kdkppn: kdkppn || null,
          kdlokasi: kdlokasi || null,
        },
        type: db.QueryTypes.INSERT,
      });

      successResponse(
        res,
        { username, name: nama, role },
        "User berhasil ditambahkan"
      );
    } catch (error) {
      console.error("Error creating user:", error);
      errorResponse(res, "Gagal menambahkan user", 500);
    }
  }

  // Update user
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { username, nama, role, active, kdkanwil, kdkppn, kdlokasi } =
        req.body;

      // Check if user exists
      const checkQuery = "SELECT id FROM users WHERE id = :id";
      const existingUser = await db.query(checkQuery, {
        replacements: { id },
        type: db.QueryTypes.SELECT,
      });

      if (!existingUser || existingUser.length === 0) {
        return errorResponse(res, "User tidak ditemukan", 404);
      }

      // Update user
      const updateQuery = `
        UPDATE users 
        SET username = :username, name = :name, role = :role, active = :active, 
            kdkanwil = :kdkanwil, kdkppn = :kdkppn, kdlokasi = :kdlokasi, updatedAt = NOW()
        WHERE id = :id
      `;

      await db.query(updateQuery, {
        replacements: {
          id,
          username,
          name: nama,
          role,
          active: active ? "1" : "0",
          kdkanwil: kdkanwil || null,
          kdkppn: kdkppn || null,
          kdlokasi: kdlokasi || null,
        },
        type: db.QueryTypes.UPDATE,
      });

      successResponse(
        res,
        { id, username, name: nama, role },
        "User berhasil diupdate"
      );
    } catch (error) {
      console.error("Error updating user:", error);
      errorResponse(res, "Gagal mengupdate user", 500);
    }
  }

  // Delete user (soft delete)
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Check if user exists
      const checkQuery = "SELECT id FROM users WHERE id = :id";
      const existingUser = await db.query(checkQuery, {
        replacements: { id },
        type: db.QueryTypes.SELECT,
      });

      if (!existingUser || existingUser.length === 0) {
        return errorResponse(res, "User tidak ditemukan", 404);
      }

      // Soft delete by setting active to 0
      const deleteQuery =
        "UPDATE users SET active = '0', updatedAt = NOW() WHERE id = :id";
      await db.query(deleteQuery, {
        replacements: { id },
        type: db.QueryTypes.UPDATE,
      });

      successResponse(res, { id }, "User berhasil dihapus");
    } catch (error) {
      console.error("Error deleting user:", error);
      errorResponse(res, "Gagal menghapus user", 500);
    }
  }

  // Legacy query handler (for backward compatibility)
  static async legacyQuery(req, res) {
    try {
      const { query } = req.body;
      const decryptedData = decryptData(query);

      if (!decryptedData) {
        return errorResponse(res, "Invalid query data", 400);
      }

      const results = await db.query(decryptedData, {
        type: db.QueryTypes.SELECT,
      });

      return res.json({ result: results });
    } catch (error) {
      console.error("Error executing legacy query:", error);
      errorResponse(res, "Gagal menjalankan query", 500);
    }
  }
}
