#!/usr/bin/env node

/**
 * Script untuk membuat user test dengan password terenkripsi
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { hashPassword } from "./helpers.js";
// import { DatabaseManager } from "./database-manager.js";
import { db } from "../config/database-multi.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

const testUsers = [
  {
    username: "admin",
    password: "admin123",
    fullName: "Administrator",
    role: "admin",
    isActive: true,
  },
  {
    username: "user1",
    password: "user123",
    fullName: "User Test 1",
    role: "user",
    isActive: true,
  },
  {
    username: "user2",
    password: "user456",
    fullName: "User Test 2",
    role: "user",
    isActive: true,
  },
  {
    username: "operator",
    password: "operator123",
    fullName: "Operator Test",
    role: "operator",
    isActive: true,
  },
];

async function createTestUsers() {
  try {
    await db.query(
      `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user', 'operator') DEFAULT 'user',
        name VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        last_login DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `
    );

    for (const user of testUsers) {
      try {
        const existing = await db.query(
          "SELECT id FROM users WHERE username = ?",
          [user.username]
        );
        if (existing.length) continue;

        const hashed = await hashPassword(user.password);
        const result = await db.query(
          `INSERT INTO users (username, password, role, name, is_active)
           VALUES (?, ?, ?, ?, ?)`,
          [user.username, hashed, user.role, user.fullName, user.isActive]
        );
      } catch (err) {
        console.error(`Gagal buat user ${user.username}:`, err.message);
      }
    }

    console.log("✅ User test selesai dibuat");
  } catch (err) {
    console.error("❌ Fatal error:", err.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createTestUsers();
