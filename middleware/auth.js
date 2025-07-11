import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { decryptData } from "../utils/decrypt.js";

dotenv.config();

// Middleware untuk verifikasi token JWT
export const verifikasiToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token akses tidak ditemukan",
    });
  }

  const Decrypttoken = decryptData(token);

  if (!Decrypttoken) {
    return res.status(401).json({
      success: false,
      message: "Token akses tidak ditemukan",
    });
  }

  jwt.verify(Decrypttoken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Token tidak valid atau sudah kedaluwarsa",
      });
    }

    req.user = decoded;
    next();
  });
};

// Middleware untuk verifikasi role/peran
export const verifikasiRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User tidak terautentikasi",
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Role Anda tidak memiliki izin",
      });
    }

    next();
  };
};

// Middleware untuk log aktivitas
export const logAktivitas = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - IP: ${
      req.ip
    }`
  );

  // Override res.json untuk log response
  const originalJson = res.json;
  res.json = function (data) {
    const duration = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${
        res.statusCode
      } - ${duration}ms`
    );
    return originalJson.call(this, data);
  };

  next();
};

// Middleware untuk handle async errors
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Middleware untuk error handling
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error
  let error = { ...err };
  error.message = err.message;

  // Sequelize validation error
  if (err.name === "SequelizeValidationError") {
    const message = err.errors.map((val) => val.message).join(", ");
    error = {
      statusCode: 400,
      message: `Validation Error: ${message}`,
    };
  }

  // Sequelize unique constraint error
  if (err.name === "SequelizeUniqueConstraintError") {
    const message = "Data sudah ada, tidak bisa duplikasi";
    error = {
      statusCode: 400,
      message,
    };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = {
      statusCode: 401,
      message: "Token tidak valid",
    };
  }

  if (err.name === "TokenExpiredError") {
    error = {
      statusCode: 401,
      message: "Token sudah kedaluwarsa",
    };
  }

  // Database connection errors
  if (err.name === "SequelizeConnectionError") {
    error = {
      statusCode: 500,
      message: "Database connection error",
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// Middleware untuk validasi input
export const validasiInput = (validations) => {
  return async (req, res, next) => {
    // Jalankan semua validasi
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Import hasil validasi
    const { validationResult } = await import("express-validator");
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = [];
    errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));

    return res.status(400).json({
      success: false,
      message: "Validasi input gagal",
      errors: extractedErrors,
    });
  };
};
