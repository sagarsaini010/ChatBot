import Message from "../models/message.model.js";
import ChatSession from "../models/chatSession.model.js";
import { generateAIReply } from "./ai.service.js";

export const chatService = {
  async sendMessage({ message, sessionId, userId, guestId }) {
    //  Check session
    const session = await ChatSession.findById(sessionId);
    if (!session) {
      throw new Error("Chat session not found");
    }

    // Save user message
    await Message.create({
      sessionId,
      userId,
      guestId,
      role: "user",
      content: message,
    });

    //  Fetch last 10 messages (context)
    const messages = await Message.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const context = messages.reverse().map((msg) => ({
      role: msg.role === "model" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    //  Call AI
    const aiReply = await generateAIReply(context);

    // Save AI message
    await Message.create({
      sessionId,
      userId,
      guestId,
      role: "model",
      content: aiReply,
    });

    // Update session
    session.lastMessageAt = new Date();
    await session.save();

    return {
      reply: aiReply,
    };
  },
};
