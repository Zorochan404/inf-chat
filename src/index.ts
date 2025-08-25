import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import connectDB from "./db/db.js";
import authRoutes from "./auth/authRoutes.js";
import chatRoutes from "./chatSession/chatSessionRoutes.js";
import { setSocketIO } from "./chatSession/chatSessionController.js";
import { authenticateToken } from "./middlewares/auth.js";
import groupRoutes from "./studyGroup/studyGroupRoutes.js";
import userRoutes from "./users/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = createServer(app);

// Setup Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Set socket.io instance for chat controller
setSocketIO(io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/chat", authenticateToken, chatRoutes);
app.use('/api/v1/study-group', groupRoutes)
app.use('/api/v1/users', authenticateToken, userRoutes)

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Chat Application API",
    version: "1.0.0",
    status: "Server is running",
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Join user to their personal room for targeted messaging
  socket.on("join_user_room", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined their room`);
  });

  // Handle user going online
  socket.on("user_online", async (userId) => {
    try {
      // Update user online status in database if needed
      socket.join(`user_${userId}`);
      socket.broadcast.emit("user_status_change", { userId, isOnline: true });
      console.log(`🟢 User ${userId} is online`);
    } catch (error) {
      console.error("Error updating user online status:", error);
    }
  });

  // Handle typing indicators
  socket.on("typing_start", (data) => {
    socket.to(`user_${data.receiverId}`).emit("user_typing", {
      senderId: data.senderId,
      isTyping: true,
    });
  });

  socket.on("typing_stop", (data) => {
    socket.to(`user_${data.receiverId}`).emit("user_typing", {
      senderId: data.senderId,
      isTyping: false,
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// Start server function
const startServer = async () => {
  try {
    // Initialize database connection first
    await connectDB();

    // Start server only after DB connection is successful
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 API available at: http://localhost:${PORT}`);
      console.log(`❤️  Health check: http://localhost:${PORT}/health`);
      console.log(`💬 Socket.IO ready for connections`);
      console.log(`📨 Chat API: http://localhost:${PORT}/api/chat/send`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the application
startServer();

export default app;
