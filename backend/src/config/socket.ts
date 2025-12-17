import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { ITask } from "../types/types";

interface UserSocket extends Socket {
  userId?: string;
  userName?: string;
}

let io: Server;

// Track online users
const onlineUsers = new Map<string, string>(); // userId -> socketId

export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket: UserSocket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    // Register user with their userId
    socket.on("register", (data: { userId: string; userName: string }) => {
      if (!data.userId) return;

      socket.userId = data.userId;
      socket.userName = data.userName;
      onlineUsers.set(data.userId, socket.id);

      // Join user's personal room for direct notifications
      socket.join(`user:${data.userId}`);

      console.log(`👤 User registered: ${data.userName} (${data.userId})`);

      // Broadcast online users to all connected clients
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });

    socket.on("join:dashboard", () => {
      socket.join("dashboard");
      console.log(`📊 User ${socket.userName || socket.id} joined dashboard`);
    });

    socket.on("leave:dashboard", () => {
      socket.leave("dashboard");
      console.log(`📊 User ${socket.userName || socket.id} left dashboard`);
    });

    socket.on("join:board", (boardId: string) => {
      socket.join(`board:${boardId}`);
      console.log(
        `📋 User ${socket.userName || socket.id} joined board ${boardId}`
      );

      // Notify other users in the board
      socket.to(`board:${boardId}`).emit("user:joined", {
        userId: socket.userId,
        userName: socket.userName,
      });
    });

    socket.on("leave:board", (boardId: string) => {
      socket.leave(`board:${boardId}`);
      console.log(
        `📋 User ${socket.userName || socket.id} left board ${boardId}`
      );

      // Notify other users in the board
      socket.to(`board:${boardId}`).emit("user:left", {
        userId: socket.userId,
        userName: socket.userName,
      });
    });

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.userName || socket.id}`);

      // Remove from online users
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        // Broadcast updated online users
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      }
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

export const emitTaskUpdate = (task: ITask) => {
  const io = getIO();
  // Emit to dashboard room and to assigned user
  io.to("dashboard").emit("task:updated", task);
  if (task.assignedToId) {
    io.to(`user:${task.assignedToId.toString()}`).emit("task:updated", task);
  }
  if (task.creatorId) {
    io.to(`user:${task.creatorId.toString()}`).emit("task:updated", task);
  }
};

export const emitTaskCreated = (task: ITask) => {
  const io = getIO();
  // Emit to dashboard room and to assigned user
  io.to("dashboard").emit("task:created", task);
  if (task.assignedToId) {
    io.to(`user:${task.assignedToId.toString()}`).emit("task:created", task);
  }
  if (task.creatorId) {
    io.to(`user:${task.creatorId.toString()}`).emit("task:created", task);
  }
};

export const emitTaskDeleted = (taskId: string) => {
  const io = getIO();
  // Broadcast to all users in dashboard
  io.to("dashboard").emit("task:deleted", { taskId });
};

export const emitAssignmentNotification = (
  userId: string,
  notification: {
    taskId: string;
    taskTitle: string;
    assignedBy: string;
    assignedByName: string;
    createdAt: Date;
  }
) => {
  const io = getIO();
  io.to(`user:${userId}`).emit("notification:assignment", notification);
};

export const getOnlineUsers = (): string[] => {
  return Array.from(onlineUsers.keys());
};

export const isUserOnline = (userId: string): boolean => {
  return onlineUsers.has(userId);
};
