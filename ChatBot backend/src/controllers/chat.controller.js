import { chatService } from "../services/chat.service.js";
export const sendMessage = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({
        success: false,
        error: "message and sessionId required",
      });
    }

    const userId = req.userId || null;
    const guestId = req.guestId || null;
    console.log("sendMessage IDs:", { userId, guestId });
    const reply = await chatService.sendMessage({
      message,
      sessionId,
      userId,
      guestId,
    });

    res.status(200).json({
      success: true,
      data: reply,
    });
  } catch (error) {
    next(error);
  }
};
