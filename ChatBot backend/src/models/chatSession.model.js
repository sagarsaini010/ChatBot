import mongoose from "mongoose";

const chatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, 
    },

    guestId: {
      type: String,
      default: null, 
    },

    title: {
      type: String,
      default: "New Chat",
      trim: true,
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const ChatSession = mongoose.model("ChatSession", chatSessionSchema);
export default ChatSession;
