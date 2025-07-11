import { User } from "../models/user.js";
import {
  executeTransaction,
  DATABASE_TYPES,
} from "../utils/database-manager.js";
import bcrypt from "bcrypt";

export class UserService {
  // Membuat user baru dengan logging dan stats
  static async createUser(userData) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Buat user di database utama
      const user = await User.create({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        full_name: userData.full_name || null,
      });

      // Return user tanpa password
      const { password, ...userWithoutPassword } = user.toJSON();
      return {
        success: true,
        data: userWithoutPassword,
        message: "User berhasil dibuat",
      };
    } catch (error) {
      console.error("Error creating user:", error);
      return {
        success: false,
        error: error.message,
        message: "Gagal membuat user",
      };
    }
  }

  // Login user dengan update stats
  static async loginUser(username, password, loginInfo = {}) {
    try {
      // Cari user di database utama
      const user = await User.findOne({
        where: { username },
      });

      if (!user) {
        return {
          success: false,
          message: "Username tidak ditemukan",
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: "Password salah",
        };
      }

      // Update last login
      await user.update({
        last_login: new Date(),
      });

      // Log aktivitas login
      await UserLog.create({
        user_id: user.id,
        action: "LOGIN",
        description: `User ${username} login`,
        ip_address: loginInfo.ip_address || null,
        user_agent: loginInfo.user_agent || null,
      });

      // Update stats
      await UserStats.increment(
        { total_logins: 1 },
        { where: { user_id: user.id } }
      );

      // Return user tanpa password
      const { password: _, ...userWithoutPassword } = user.toJSON();
      return {
        success: true,
        data: userWithoutPassword,
        message: "Login berhasil",
      };
    } catch (error) {
      console.error("Error login user:", error);
      return {
        success: false,
        error: error.message,
        message: "Gagal login",
      };
    }
  }

  // Mendapatkan user dengan statistik
  static async getUserWithStats(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        return {
          success: false,
          message: "User tidak ditemukan",
        };
      }

      const stats = await UserStats.findOne({
        where: { user_id: userId },
      });

      const recentLogs = await UserLog.findAll({
        where: { user_id: userId },
        order: [["timestamp", "DESC"]],
        limit: 5,
      });

      return {
        success: true,
        data: {
          user: user.toJSON(),
          statistics: stats ? stats.toJSON() : null,
          recent_activities: recentLogs.map((log) => log.toJSON()),
        },
        message: "Data user berhasil diambil",
      };
    } catch (error) {
      console.error("Error getting user with stats:", error);
      return {
        success: false,
        error: error.message,
        message: "Gagal mengambil data user",
      };
    }
  }

  // Mendapatkan semua user dengan pagination
  static async getAllUsers(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await User.findAndCountAll({
        attributes: { exclude: ["password"] },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["created_at", "DESC"]],
      });

      return {
        success: true,
        data: {
          users: rows.map((user) => user.toJSON()),
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(count / limit),
            total_records: count,
            records_per_page: parseInt(limit),
          },
        },
        message: "Data users berhasil diambil",
      };
    } catch (error) {
      console.error("Error getting all users:", error);
      return {
        success: false,
        error: error.message,
        message: "Gagal mengambil data users",
      };
    }
  }

  // Logout user dengan update session stats
  static async logoutUser(userId, sessionDuration = 0) {
    try {
      // Log aktivitas logout
      await UserLog.create({
        user_id: userId,
        action: "LOGOUT",
        description: `User logout dengan durasi sesi ${sessionDuration} menit`,
      });

      // Update stats
      await UserStats.increment(
        {
          total_sessions: 1,
          average_session_duration: sessionDuration,
        },
        { where: { user_id: userId } }
      );

      return {
        success: true,
        message: "Logout berhasil",
      };
    } catch (error) {
      console.error("Error logout user:", error);
      return {
        success: false,
        error: error.message,
        message: "Gagal logout",
      };
    }
  }
}
