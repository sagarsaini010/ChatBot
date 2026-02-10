import mongoose from "mongoose";
import ChatSession from "../models/chatSession.model.js";


export const setTitle = async (req, res, next) => {
  try {
    console.log("setTitle called with body:", req.body);
    const { sessionId, title } = req.body;
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
    };
    console.log("setTitle filter:", filter);
    const session = await ChatSession.findOneAndUpdate(
      filter,
      { title },
        { new: true }
    );
    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Chat session not found",
      });
    }
    res.status(200).json({
      success: true,
      title: session.title,
    });
    } catch (error) {
    next(error);
  }
};