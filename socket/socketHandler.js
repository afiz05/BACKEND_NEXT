import { Server } from "socket.io";

// Penyimpanan data socket
let serverSocket = null;
let pengguna_online = new Map();
let ruang_notifikasi = new Map();

// Inisialisasi socket server
export const inisialisasiSocket = (server, corsOptions) => {
  serverSocket = new Server(server, {
    cors: corsOptions,
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 30000,
    maxHttpBufferSize: 1e6, // 1MB
    allowEIO3: true,
    transports: ["websocket", "polling"],
    allowUpgrades: true,
  });

  // Event ketika client terhubung
  serverSocket.on("connection", (socket) => {
    console.log(`✅ Client terhubung: ${socket.id}`);

    // Setup event handlers
    setupEventHandlers(socket);

    // Kirim informasi awal
    socket.emit("koneksi_berhasil", {
      socketId: socket.id,
      timestamp: new Date().toISOString(),
      message: "Koneksi berhasil",
    });
  });

  return serverSocket;
};

// Setup event handlers untuk socket
const setupEventHandlers = (socket) => {
  // Event ketika user online
  socket.on("user_online", (data) => {
    handleUserOnline(socket, data);
  });

  // Event ketika user offline
  socket.on("user_offline", (data) => {
    handleUserOffline(socket, data);
  });

  // Event untuk join room
  socket.on("join_room", (data) => {
    handleJoinRoom(socket, data);
  });

  // Event untuk leave room
  socket.on("leave_room", (data) => {
    handleLeaveRoom(socket, data);
  });

  // Event untuk mengirim pesan
  socket.on("kirim_pesan", (data) => {
    handleKirimPesan(socket, data);
  });

  // Event untuk notifikasi
  socket.on("kirim_notifikasi", (data) => {
    handleKirimNotifikasi(socket, data);
  });

  // Event untuk broadcast
  socket.on("broadcast", (data) => {
    handleBroadcast(socket, data);
  });

  // Event ketika client disconnect
  socket.on("disconnect", (reason) => {
    handleDisconnect(socket, reason);
  });

  // Event untuk error handling
  socket.on("error", (error) => {
    console.error(`❌ Socket error untuk ${socket.id}:`, error);
  });
};

// Handler untuk user online
const handleUserOnline = (socket, data) => {
  try {
    const { userId, username, role } = data;

    const userData = {
      socketId: socket.id,
      userId,
      username,
      role,
      ip: getClientIP(socket),
      connectedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    };

    pengguna_online.set(socket.id, userData);
    socket.userId = userId;
    socket.username = username;

    // Broadcast update daftar user online
    broadcastUserList();

    console.log(`👤 User online: ${username} (${socket.id})`);

    // Kirim konfirmasi ke client
    socket.emit("user_online_success", {
      message: "Berhasil set user online",
      userData,
    });
  } catch (error) {
    console.error("Error handle user online:", error);
    socket.emit("error", { message: "Gagal set user online" });
  }
};

// Handler untuk user offline
const handleUserOffline = (socket, data) => {
  try {
    const userData = pengguna_online.get(socket.id);
    if (userData) {
      pengguna_online.delete(socket.id);

      // Broadcast update daftar user online
      broadcastUserList();

      console.log(`👤 User offline: ${userData.username} (${socket.id})`);
    }
  } catch (error) {
    console.error("Error handle user offline:", error);
  }
};

// Handler untuk join room
const handleJoinRoom = (socket, data) => {
  try {
    const { room } = data;
    socket.join(room);

    // Update data user dengan room
    const userData = pengguna_online.get(socket.id);
    if (userData) {
      userData.currentRoom = room;
      userData.lastActivity = new Date().toISOString();
      pengguna_online.set(socket.id, userData);
    }

    console.log(`🏠 User ${socket.username} bergabung ke room: ${room}`);

    // Notifikasi ke room
    socket.to(room).emit("user_joined_room", {
      username: socket.username,
      room,
      timestamp: new Date().toISOString(),
    });

    socket.emit("join_room_success", { room });
  } catch (error) {
    console.error("Error join room:", error);
    socket.emit("error", { message: "Gagal bergabung ke room" });
  }
};

// Handler untuk leave room
const handleLeaveRoom = (socket, data) => {
  try {
    const { room } = data;
    socket.leave(room);

    // Update data user
    const userData = pengguna_online.get(socket.id);
    if (userData) {
      userData.currentRoom = null;
      userData.lastActivity = new Date().toISOString();
      pengguna_online.set(socket.id, userData);
    }

    console.log(`🏠 User ${socket.username} keluar dari room: ${room}`);

    // Notifikasi ke room
    socket.to(room).emit("user_left_room", {
      username: socket.username,
      room,
      timestamp: new Date().toISOString(),
    });

    socket.emit("leave_room_success", { room });
  } catch (error) {
    console.error("Error leave room:", error);
    socket.emit("error", { message: "Gagal keluar dari room" });
  }
};

// Handler untuk kirim pesan
const handleKirimPesan = (socket, data) => {
  try {
    const { room, message, type = "text" } = data;

    const pesanData = {
      id: generateId(),
      from: socket.username,
      fromId: socket.userId,
      message,
      type,
      room,
      timestamp: new Date().toISOString(),
    };

    // Kirim pesan ke room
    if (room) {
      socket.to(room).emit("pesan_masuk", pesanData);
    } else {
      // Broadcast ke semua client
      socket.broadcast.emit("pesan_masuk", pesanData);
    }

    // Konfirmasi ke pengirim
    socket.emit("pesan_terkirim", pesanData);

    console.log(`💬 Pesan dari ${socket.username}: ${message}`);
  } catch (error) {
    console.error("Error kirim pesan:", error);
    socket.emit("error", { message: "Gagal mengirim pesan" });
  }
};

// Handler untuk kirim notifikasi
const handleKirimNotifikasi = (socket, data) => {
  try {
    const { target, title, message, type = "info" } = data;

    const notifikasiData = {
      id: generateId(),
      from: socket.username,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
    };

    if (target === "all") {
      // Kirim ke semua client
      socket.broadcast.emit("notifikasi_masuk", notifikasiData);
    } else if (target === "room") {
      // Kirim ke room tertentu
      const { room } = data;
      socket.to(room).emit("notifikasi_masuk", notifikasiData);
    } else {
      // Kirim ke user tertentu
      const targetSocket = findSocketByUserId(target);
      if (targetSocket) {
        targetSocket.emit("notifikasi_masuk", notifikasiData);
      }
    }

    socket.emit("notifikasi_terkirim", notifikasiData);

    console.log(`🔔 Notifikasi dari ${socket.username}: ${title}`);
  } catch (error) {
    console.error("Error kirim notifikasi:", error);
    socket.emit("error", { message: "Gagal mengirim notifikasi" });
  }
};

// Handler untuk broadcast
const handleBroadcast = (socket, data) => {
  try {
    const { message, type = "broadcast" } = data;

    const broadcastData = {
      id: generateId(),
      from: socket.username,
      message,
      type,
      timestamp: new Date().toISOString(),
    };

    // Kirim ke semua client kecuali pengirim
    socket.broadcast.emit("broadcast_masuk", broadcastData);

    socket.emit("broadcast_terkirim", broadcastData);

    console.log(`📢 Broadcast dari ${socket.username}: ${message}`);
  } catch (error) {
    console.error("Error broadcast:", error);
    socket.emit("error", { message: "Gagal mengirim broadcast" });
  }
};

// Handler untuk disconnect
const handleDisconnect = (socket, reason) => {
  try {
    const userData = pengguna_online.get(socket.id);

    if (userData) {
      pengguna_online.delete(socket.id);
      broadcastUserList();

      console.log(
        `👤 User disconnect: ${userData.username} (${socket.id}) - Reason: ${reason}`
      );
    } else {
      console.log(`👤 Client disconnect: ${socket.id} - Reason: ${reason}`);
    }
  } catch (error) {
    console.error("Error handle disconnect:", error);
  }
};

// Fungsi utility
const getClientIP = (socket) => {
  const forwarded = socket.handshake.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return (
    socket.handshake.headers["x-real-ip"] ||
    socket.handshake.address ||
    socket.conn?.remoteAddress ||
    "127.0.0.1"
  );
};

const broadcastUserList = () => {
  const userList = Array.from(pengguna_online.values()).map((user) => ({
    userId: user.userId,
    username: user.username,
    role: user.role,
    connectedAt: user.connectedAt,
    lastActivity: user.lastActivity,
    currentRoom: user.currentRoom,
  }));

  if (serverSocket) {
    serverSocket.emit("update_user_list", userList);
  }
};

const findSocketByUserId = (userId) => {
  for (const [socketId, userData] of pengguna_online.entries()) {
    if (userData.userId === userId) {
      return serverSocket.sockets.sockets.get(socketId);
    }
  }
  return null;
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Fungsi untuk mendapatkan statistik
export const getSocketStats = () => {
  return {
    totalConnections: pengguna_online.size,
    onlineUsers: Array.from(pengguna_online.values()),
    rooms: Array.from(ruang_notifikasi.keys()),
    timestamp: new Date().toISOString(),
  };
};

// Fungsi untuk mendapatkan instance socket server
export const getSocketServer = () => {
  return serverSocket;
};

// Fungsi untuk emit ke semua client
export const broadcastToAll = (event, data) => {
  if (serverSocket) {
    serverSocket.emit(event, data);
  }
};

// Fungsi untuk emit ke room tertentu
export const broadcastToRoom = (room, event, data) => {
  if (serverSocket) {
    serverSocket.to(room).emit(event, data);
  }
};

// Fungsi untuk emit ke user tertentu
export const emitToUser = (userId, event, data) => {
  const socket = findSocketByUserId(userId);
  if (socket) {
    socket.emit(event, data);
  }
};
