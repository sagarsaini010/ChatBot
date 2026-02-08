import mongoose from "mongoose";
import ChatSession from "../models/chatSession.model.js";
import Message from "../models/message.model.js";

/**
 * Create a new chat session
 */
export const createSession = async (req, res, next) => {
  try {
    const { title } = req.body;

    const userId = req.userId || null;
    const guestId = req.guestId || null;

    const session = await ChatSession.create({
      title: title || "New Chat",
      userId,
      guestId,
    });

    res.status(201).json({
      success: true,
      data: {
        sessionId: session._id,
        title: session.title,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all chat sessions for logged-in user or guest
 */
export const getSessions = async (req, res, next) => {
  try {
    console.log("Body:", req.body);

    const userId = req.userId || req.body?.userId || null;
    const guestId = req.guestId || req.body?.guestId || null;
       console.log("Debug IDs:", { userId, guestId }); // Check karein console mein kya aa raha hai
    const filter = userId
      ? { userId }
      : { guestId };

    const sessions = await ChatSession.find(filter)
      .sort({ lastMessageAt: -1 })
      .select("_id title lastMessageAt createdAt");

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a chat session and its messages
 */
export const deleteSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid sessionId",
      });
    }

    const userId = req.userId || req.body?.userId || null;
    const guestId = req.guestId || req.body?.guestId || null;

    const filter = {
      _id: sessionId,
      ...(userId ? { userId } : { guestId }),
    };

    const session = await ChatSession.findOneAndDelete(filter);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Chat session not found",
      });
    }

    // Delete all messages of this session
    await Message.deleteMany({ sessionId });

    res.status(200).json({
      success: true,
      message: "Chat session deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


export const getSessionMessages = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.userId || req.body.userId || null;
    const guestId = req.guestId || req.body.guestId || null;

    console.log("IDs:", { userId, guestId, sessionId });

    // 1. Verify session
    const sessionExists = await ChatSession.findOne({
      _id: sessionId,
      ...(userId ? { userId } : { guestId }),
    });

    if (!sessionExists) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      });
    }

    // 2. Get messages
    const messages = await Message.find({ sessionId })
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: messages,
    });

  } catch (error) {
    next(error);
  }
};
