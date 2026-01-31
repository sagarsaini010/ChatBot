import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatSession",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, 
    },

    guestId: {
      type: String,
      default: null, 
    },

    role: {
      type: String,
      enum: ["user", "model", "system"],
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);
// Index to quickly fetch messages of a session in chronological order
messageSchema.index({ sessionId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
