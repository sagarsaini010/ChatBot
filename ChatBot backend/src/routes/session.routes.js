import express from "express";
import {
  createSession,
  getSessions,
  deleteSession,
} from "../controllers/session.controller.js";
import { guestMiddleware } from "../middleware/guest.middleware.js";
// import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * Create new chat session
 * Guest or Logged-in user
 */
router.post(
  "/",
  guestMiddleware,
  createSession
);

/**
 * Get all chat sessions of user / guest
 */
router.get(
  "/",
  guestMiddleware,
  getSessions
);

/**
 * Delete a chat session
 */
router.delete(
  "/:sessionId",
  guestMiddleware,
  deleteSession
);

export default router;
