import { Request, Response } from "express";
import { chatSession } from "./chatSessionModel.js";
import { directMessage } from "../directMessage/directMessageModel.js";
import { User } from "../auth/userModel.js";
import { Server as SocketIOServer } from "socket.io";
import mongoose from "mongoose";

// Interface for send message request
interface SendMessageRequest {
  receiverId: string;
  content: string;
  messageType?: "text" | "image" | "file";
  fileUrl?: string;
  fileName?: string;
}

// Interface for message response
interface MessageResponse {
  _id: string;
  chat_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  messageType: string;
  fileUrl?: string;
  fileName?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Store socket.io server instance
let io: SocketIOServer;

// Set socket.io server instance
export const setSocketIO = (socketServer: SocketIOServer) => {
  io = socketServer;
};

export const sendMessage = async (
  req: Request<{}, {}, SendMessageRequest>,
  res: Response
) => {
  try {
    const {
      receiverId,
      content,
      messageType = "text",
      fileUrl,
      fileName,
    } = req.body;
    const senderId = (req as any).user?.userId; // Assuming user is attached via auth middleware

    // Validation
    if (!senderId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID and content are required",
      });
    }

    // Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(senderId) ||
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user IDs provided",
      });
    }

    // Check if both users exist
    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId),
    ]);

    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        message: "Sender or receiver not found",
      });
    }

    // Validate roles (student-teacher communication)
    const isValidCommunication =
      (sender.role === "student" && receiver.role === "teacher") ||
      (sender.role === "teacher" && receiver.role === "student");

    if (!isValidCommunication) {
      return res.status(403).json({
        success: false,
        message: "Communication only allowed between students and teachers",
      });
    }

    // Determine student and teacher IDs
    const studentId = sender.role === "student" ? senderId : receiverId;
    const teacherId = sender.role === "teacher" ? senderId : receiverId;

    // Check if chat session exists
    let session = await chatSession.findOne({
      student_id: studentId,
      professor_id: teacherId,
    });

    // Create new session if it doesn't exist
    if (!session) {
      session = new chatSession({
        student_id: studentId,
        professor_id: teacherId,
        unreadCount: 0,
        isActive: true,
      });
      await session.save();
      console.log(`✅ New chat session created: ${session._id}`);
    }

    // Create the message
    const newMessage = new directMessage({
      chat_id: session._id,
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      messageType,
      fileUrl,
      fileName,
      status: "sent",
    });

    // Save the message
    const savedMessage = await newMessage.save();

    // Update session with last message info
    await chatSession.findByIdAndUpdate(session._id, {
      last_message_id: savedMessage._id.toString(),
      $inc: { unreadCount: 1 },
      isActive: true,
    });

    // Prepare message response
    const messageResponse: MessageResponse = {
      _id: savedMessage._id.toString(),
      chat_id: savedMessage.chat_id?.toString() || "",
      sender_id: savedMessage.sender_id?.toString() || "",
      receiver_id: savedMessage.receiver_id?.toString() || "",
      content: savedMessage.content || "",
      messageType: savedMessage.messageType || "text",
      fileUrl: savedMessage.fileUrl || undefined,
      fileName: savedMessage.fileName || undefined,
      status: savedMessage.status || "sent",
      createdAt: savedMessage.createdAt,
      updatedAt: savedMessage.updatedAt,
    };

    // Emit message via socket.io to receiver
    if (io) {
      // Emit to receiver's room
      io.to(`user_${receiverId}`).emit("new_message", {
        message: messageResponse,
        session: {
          _id: session._id,
          student_id: session.student_id,
          professor_id: session.professor_id,
          isActive: session.isActive,
        },
        sender: {
          _id: sender._id,
          name: sender.name,
          avatar: sender.avatar,
          role: sender.role,
        },
      });

      // Emit to sender's room for confirmation
      io.to(`user_${senderId}`).emit("message_sent", {
        message: messageResponse,
        session: {
          _id: session._id,
          student_id: session.student_id,
          professor_id: session.professor_id,
          isActive: session.isActive,
        },
      });

      console.log(
        `📤 Message sent via socket.io from ${sender.name} to ${receiver.name}`
      );
    }

    // Send HTTP response
    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: {
        message: messageResponse,
        session: {
          _id: session._id,
          student_id: session.student_id,
          professor_id: session.professor_id,
          isActive: session.isActive,
          unreadCount: session.unreadCount,
        },
      },
    });
  } catch (error) {
    console.error("❌ Send message error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
};

// Get chat history for a session with pagination
export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const { receiverId } = req.params;
    const { page = 1, limit = 50, lastMessageId } = req.query;
    const senderId = (req as any).user?.userId;

    if (!senderId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        success: false,
        message: "Valid receiver ID is required",
      });
    }

    // Validate pagination parameters
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    if (pageNum < 1 || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid pagination parameters. Page must be >= 1, limit must be between 1-50",
      });
    }

    // Find the chat session
    const session = await chatSession.findOne({
      $or: [
        { student_id: senderId, professor_id: receiverId },
        { student_id: receiverId, professor_id: senderId },
      ],
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Chat session not found",
      });
    }

    // Build query for pagination
    let query: any = { chat_id: session._id };

    // If lastMessageId is provided, get messages older than that message (for scroll-up loading)
    if (
      lastMessageId &&
      mongoose.Types.ObjectId.isValid(String(lastMessageId))
    ) {
      query._id = { $lt: lastMessageId };
    }

    // Get total message count for pagination info
    const totalMessages = await directMessage.countDocuments({
      chat_id: session._id,
    });

    // Get messages with pagination (newest first, then reverse for chronological order)
    const messages = await directMessage
      .find(query)
      .populate("sender_id", "name avatar role")
      .populate("receiver_id", "name avatar role")
      .sort({ _id: -1 }) // Get newest first
      .limit(limitNum)
      .lean();

    // Reverse to show oldest first in the current batch
    const reversedMessages = messages.reverse();

    // Calculate pagination info
    const hasMore = messages.length === limitNum;
    const oldestMessageId = messages.length > 0 ? messages[0]._id : null;
    const newestMessageId =
      messages.length > 0 ? messages[messages.length - 1]._id : null;

    res.status(200).json({
      success: true,
      message: "Chat history retrieved successfully",
      data: {
        session: {
          _id: session._id,
          student_id: session.student_id,
          professor_id: session.professor_id,
          isActive: session.isActive,
          unreadCount: session.unreadCount,
        },
        messages: reversedMessages,
        pagination: {
          hasMore,
          totalMessages,
          loadedCount: messages.length,
          oldestMessageId,
          newestMessageId,
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    console.error("❌ Get chat history error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve chat history. Please try again later.",
    });
  }
};

// Load older messages for scroll-up pagination
export const loadOlderMessages = async (req: Request, res: Response) => {
  try {
    const { receiverId } = req.params;
    const { beforeMessageId, limit = 20 } = req.query;
    const senderId = (req as any).user?.userId;

    if (!senderId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        success: false,
        message: "Valid receiver ID is required",
      });
    }

    if (
      !beforeMessageId ||
      !mongoose.Types.ObjectId.isValid(String(beforeMessageId))
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid beforeMessageId is required for loading older messages",
      });
    }

    // Validate limit parameter
    const limitNum = parseInt(limit as string, 10);
    if (limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        success: false,
        message: "Limit must be between 1-50",
      });
    }

    // Find the chat session
    const session = await chatSession.findOne({
      $or: [
        { student_id: senderId, professor_id: receiverId },
        { student_id: receiverId, professor_id: senderId },
      ],
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Chat session not found",
      });
    }

    // Get messages older than the specified message ID
    const messages = await directMessage
      .find({
        chat_id: session._id,
        _id: { $lt: beforeMessageId }, // Get messages with ID less than (older than) beforeMessageId
      })
      .populate("sender_id", "name avatar role")
      .populate("receiver_id", "name avatar role")
      .sort({ _id: -1 }) // Get newest first (of the older messages)
      .limit(limitNum)
      .lean();

    // Reverse to show oldest first in chronological order
    const reversedMessages = messages.reverse();

    // Check if there are more older messages
    const hasMoreOlder = messages.length === limitNum;
    const oldestMessageId = messages.length > 0 ? messages[0]._id : null;

    res.status(200).json({
      success: true,
      message: "Older messages loaded successfully",
      data: {
        messages: reversedMessages,
        pagination: {
          hasMoreOlder,
          loadedCount: messages.length,
          oldestMessageId,
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    console.error("❌ Load older messages error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load older messages. Please try again later.",
    });
  }
};
