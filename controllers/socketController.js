import { successResponse, errorResponse } from "../utils/helpers.js";
import {
  getSocketServer,
  getSocketStats,
  broadcastToAll,
  broadcastToRoom,
  emitToUser,
} from "../socket/socketHandler.js";

export class SocketController {
  static routes = [
    {
      method: "get",
      path: "/stats",
      handler: SocketController.getStats,
      auth: ["0", "1", "2", "3", "4"], // All authenticated users
    },
    {
      method: "get",
      path: "/online-users",
      handler: SocketController.getOnlineUsers,
      auth: ["0", "1", "2", "3", "4"], // All authenticated users
    },
    {
      method: "post",
      path: "/broadcast",
      handler: SocketController.broadcast,
      auth: ["0", "1", "2", "3", "4"], // All authenticated users
    },
    {
      method: "post",
      path: "/broadcast-room",
      handler: SocketController.broadcastRoom,
      auth: ["0", "1", "2", "3", "4"], // All authenticated users
    },
    {
      method: "post",
      path: "/message-user",
      handler: SocketController.messageUser,
      auth: ["0", "1", "2", "3", "4"], // All authenticated users
    },
    {
      method: "post",
      path: "/disconnect-user",
      handler: SocketController.disconnectUser,
      auth: ["0"], // Admin only
    },
    {
      method: "get",
      path: "/server-info",
      handler: SocketController.getServerInfo,
      auth: ["0", "1", "2", "3", "4"], // All authenticated users
    },
  ];

  static async getStats(req, res) {
    try {
      const stats = getSocketStats();
      successResponse(res, stats, "Statistik socket berhasil diambil");
    } catch (error) {
      console.error("Error in SocketController.getStats:", error);
      errorResponse(res, "Gagal mengambil statistik socket");
    }
  }

  static async getOnlineUsers(req, res) {
    try {
      const stats = getSocketStats();
      successResponse(
        res,
        stats.onlineUsers,
        "Daftar user online berhasil diambil"
      );
    } catch (error) {
      console.error("Error in SocketController.getOnlineUsers:", error);
      errorResponse(res, "Gagal mengambil daftar user online");
    }
  }

  static async broadcast(req, res) {
    try {
      const { message, type = "info" } = req.body;

      if (!message) {
        return errorResponse(res, "Pesan wajib diisi", 400);
      }

      const broadcastData = {
        id: Date.now().toString(),
        from: req.user.username,
        fromId: req.user.id,
        message,
        type,
        timestamp: new Date().toISOString(),
      };

      broadcastToAll("admin_broadcast", broadcastData);

      successResponse(res, broadcastData, "Broadcast berhasil dikirim");
    } catch (error) {
      console.error("Error in SocketController.broadcast:", error);
      errorResponse(res, "Gagal mengirim broadcast");
    }
  }

  static async broadcastRoom(req, res) {
    try {
      const { room, message, type = "info" } = req.body;

      if (!room || !message) {
        return errorResponse(res, "Room dan pesan wajib diisi", 400);
      }

      const broadcastData = {
        id: Date.now().toString(),
        from: req.user.username,
        fromId: req.user.id,
        room,
        message,
        type,
        timestamp: new Date().toISOString(),
      };

      broadcastToRoom(room, "room_broadcast", broadcastData);

      successResponse(
        res,
        broadcastData,
        `Broadcast ke room ${room} berhasil dikirim`
      );
    } catch (error) {
      console.error("Error in SocketController.broadcastRoom:", error);
      errorResponse(res, "Gagal mengirim broadcast ke room");
    }
  }

  static async messageUser(req, res) {
    try {
      const { targetUserId, message, type = "personal" } = req.body;

      if (!targetUserId || !message) {
        return errorResponse(res, "Target user ID dan pesan wajib diisi", 400);
      }

      const messageData = {
        id: Date.now().toString(),
        from: req.user.username,
        fromId: req.user.id,
        targetUserId,
        message,
        type,
        timestamp: new Date().toISOString(),
      };

      emitToUser(targetUserId, "private_message", messageData);

      successResponse(
        res,
        messageData,
        `Pesan ke user ${targetUserId} berhasil dikirim`
      );
    } catch (error) {
      console.error("Error in SocketController.messageUser:", error);
      errorResponse(res, "Gagal mengirim pesan ke user");
    }
  }

  static async disconnectUser(req, res) {
    try {
      const { targetUserId, reason = "Disconnect by admin" } = req.body;

      if (!targetUserId) {
        return errorResponse(res, "Target user ID wajib diisi", 400);
      }

      // Kirim pesan disconnect ke user
      emitToUser(targetUserId, "force_disconnect", {
        reason,
        timestamp: new Date().toISOString(),
      });

      successResponse(res, null, `User ${targetUserId} berhasil di-disconnect`);
    } catch (error) {
      console.error("Error in SocketController.disconnectUser:", error);
      errorResponse(res, "Gagal disconnect user");
    }
  }

  static async getServerInfo(req, res) {
    try {
      const socketServer = getSocketServer();

      if (!socketServer) {
        return errorResponse(res, "Socket server tidak tersedia", 500);
      }

      const serverInfo = {
        connected: socketServer.engine.clientsCount,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString(),
      };

      successResponse(res, serverInfo, "Info socket server berhasil diambil");
    } catch (error) {
      console.error("Error in SocketController.getServerInfo:", error);
      errorResponse(res, "Gagal mengambil info socket server");
    }
  }
}
