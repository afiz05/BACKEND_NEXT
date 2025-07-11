import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import moment from "moment-timezone";
import dotenv from "dotenv";

dotenv.config();

// Utility untuk JWT
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Utility untuk password
export const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Utility untuk UUID
export const generateUUID = () => {
  return uuidv4();
};

// Utility untuk tanggal
export const getTimestamp = (timezone = "Asia/Jakarta") => {
  return moment().tz(timezone).format("YYYY-MM-DD HH:mm:ss");
};

export const formatDate = (
  date,
  format = "YYYY-MM-DD HH:mm:ss",
  timezone = "Asia/Jakarta"
) => {
  return moment(date).tz(timezone).format(format);
};

// Utility untuk response API
export const successResponse = (
  res,
  data = null,
  message = "Success",
  statusCode = 200
) => {
  const response = {
    success: true,
    message,
    timestamp: getTimestamp(),
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

// ✅ Helper untuk format response kompatibel dengan backend lama
export const legacyResponse = (
  res,
  result = [],
  message = null,
  statusCode = 200
) => {
  return res.status(statusCode).json({
    result: result,
  });
};

export const inquiryResponse = (
  res,
  result = [],
  message = null,
  statusCode = 200
) => {
  return res.status(statusCode).json({
    data: result,
  });
};

// ✅ Helper untuk error response kompatibel dengan backend lama
export const legacyErrorResponse = (res, error = "Error", statusCode = 400) => {
  return res.status(statusCode).json({
    error: error,
  });
};

export const errorResponse = (
  res,
  message = "Error",
  statusCode = 400,
  errors = null
) => {
  const response = {
    success: false,
    message,
    timestamp: getTimestamp(),
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

// Utility untuk paginasi
export const getPaginationData = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

export const getPaginationResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

// Utility untuk validasi
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
  return phoneRegex.test(phone);
};

export const isValidPassword = (password) => {
  // Minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Utility untuk file
export const getFileExtension = (filename) => {
  return filename.split(".").pop().toLowerCase();
};

export const isAllowedFileType = (filename, allowedTypes = []) => {
  const extension = getFileExtension(filename);
  return allowedTypes.includes(extension);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Utility untuk string
export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars except spaces and hyphens
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

// Utility untuk array
export const removeDuplicates = (array, key = null) => {
  if (!key) {
    return [...new Set(array)];
  }

  return array.filter(
    (item, index, self) => index === self.findIndex((t) => t[key] === item[key])
  );
};

// Utility untuk object
export const removeNullUndefined = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value != null)
  );
};

// Utility untuk error handling
export const handleSequelizeError = (error) => {
  if (error.name === "SequelizeValidationError") {
    const messages = error.errors.map((err) => err.message);
    return {
      type: "validation",
      message: "Validasi gagal",
      details: messages,
    };
  }

  if (error.name === "SequelizeUniqueConstraintError") {
    return {
      type: "unique",
      message: "Data sudah ada",
      details: error.errors.map((err) => err.message),
    };
  }

  if (error.name === "SequelizeForeignKeyConstraintError") {
    return {
      type: "foreign_key",
      message: "Referensi data tidak valid",
      details: [error.original.sqlMessage],
    };
  }

  return {
    type: "database",
    message: "Database error",
    details: [error.message],
  };
};

// Utility untuk IP address
export const getClientIP = (req) => {
  return (
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    "unknown"
  );
};

// Utility untuk generate random string
export const generateRandomString = (length = 10) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

// Utility untuk sleep/delay
export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Utility untuk caching
export const cache = new Map();

export const setCache = (key, value, ttl = 300000) => {
  // default 5 minutes
  const expiry = Date.now() + ttl;
  cache.set(key, { value, expiry });
};

export const getCache = (key) => {
  const cached = cache.get(key);

  if (!cached) return null;

  if (Date.now() > cached.expiry) {
    cache.delete(key);
    return null;
  }

  return cached.value;
};

export const clearCache = (key = null) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};
