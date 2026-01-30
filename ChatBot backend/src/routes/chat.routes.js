import express from "express";
import { sendMessage } from "../controllers/chat.controller.js";
// import { authMiddleware } from "../middleware/auth.middleware.js";
import { guestMiddleware } from "../middleware/guest.middleware.js";

const router = express.Router();

/*
  One single endpoint:
  - Logged-in user → JWT required
  - Guest user → guestId required
*/

router.post(
  "/send",
  guestMiddleware,     // sets req.guestId if guest
                      // sets req.user if logged-in
  sendMessage
);

export default router;
