import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { successResponse, errorResponse } from "../utils/helpers.js";
import { db } from "../config/database-multi.js";
import { decryptData } from "../utils/decrypt.js";
import Encrypt from "../utils/encrypt.js";

export class AuthController {
  // Route definitions
  static routes = [
    {
      method: "post",
      path: "/login",
      handler: AuthController.login,
      auth: [], // Public route
    },
    {
      method: "post",
      path: "/logout",
      handler: AuthController.logout,
      auth: ["0", "1", "2", "3", "4"], // All authenticated users
    },
    {
      method: "get",
      path: "/profile",
      handler: AuthController.getProfile,
      auth: ["0", "1", "2", "3", "4"], // All authenticated users
    },
    {
      method: "put",
      path: "/profile",
      handler: AuthController.updateProfile,
      auth: ["0", "1", "2", "3", "4"], // All authenticated users
    },
  ];

  // User login
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      // Find user in database
      const users = await db.query(
        "SELECT id, username, password, role, name, active FROM users WHERE username = ? AND active = '1'",
        {
          replacements: [username],
          type: db.QueryTypes.SELECT,
        }
      );

      if (!users || users.length === 0) {
        return errorResponse(res, "Username atau password salah", 401);
      }

      const user = users[0];

      // Verify password
      let isValidPassword = false;

      // Try bcrypt first (for new users)
      try {
        isValidPassword = await bcrypt.compare(password, user.password);
      } catch (bcryptError) {
        // If bcrypt fails, try decrypt method (for legacy users)
        const decryptedPassword = decryptData(user.password);
        isValidPassword = password === decryptedPassword;
      }

      if (!isValidPassword) {
        return errorResponse(res, "Username atau password salah", 401);
      }

      // Update last login
      await db.query("UPDATE users SET updatedAt = NOW() WHERE id = ?", {
        replacements: [user.id],
        type: db.QueryTypes.UPDATE,
      });

      // Generate JWT token
      const userData = {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role || "user",
        active: user.active,
      };

      const tokenSet = jwt.sign(userData, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "24h",
        issuer: "sintesa-backend",
      });

      const encryptedToken = Encrypt(tokenSet);

      // Set cookie
      res.cookie("accessToken", encryptedToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      const responseData = {
        user: userData,
        token: encryptedToken,
        expiresIn: "24h",
      };

      successResponse(res, responseData, "Login berhasil");
    } catch (error) {
      console.error("Login error:", error);
      errorResponse(res, "Terjadi kesalahan pada server", 500);
    }
  }

  // User logout
  static async logout(req, res) {
    try {
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      successResponse(res, null, "Logout berhasil");
    } catch (error) {
      console.error("Logout error:", error);
      errorResponse(res, "Terjadi kesalahan saat logout", 500);
    }
  }

  // Get user profile
  static async getProfile(req, res) {
    try {
      const userData = {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
      };

      successResponse(res, userData, "Data profil berhasil diambil");
    } catch (error) {
      console.error("Get profile error:", error);
      errorResponse(res, "Gagal mengambil data profil", 500);
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const { name, email } = req.body;
      const userId = req.user.id;

      const updateQuery = `
        UPDATE users 
        SET name = :name, email = :email, updatedAt = NOW()
        WHERE id = :id
      `;

      await db.query(updateQuery, {
        replacements: { id: userId, name, email },
        type: db.QueryTypes.UPDATE,
      });

      successResponse(res, { name, email }, "Profil berhasil diupdate");
    } catch (error) {
      console.error("Update profile error:", error);
      errorResponse(res, "Gagal mengupdate profil", 500);
    }
  }
}
