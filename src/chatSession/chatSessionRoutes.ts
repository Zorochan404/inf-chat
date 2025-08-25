import { Router } from "express";
import {
  sendMessage,
  getChatHistory,
  loadOlderMessages,
} from "./chatSessionController.js";

const router = Router();

// Send message endpoint (authentication handled at route level)
router.post("/send", sendMessage);

// Get chat history endpoint
router.get("/history/:receiverId", getChatHistory);

// Load older messages for scroll-up pagination
router.get("/older/:receiverId", loadOlderMessages);

export default router;
