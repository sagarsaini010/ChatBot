import express from "express";
import cors from "cors";
import morgan from "morgan";

// import authRoutes from "./routes/auth.routes.js";
// import guestRoutes from "./routes/guest.routes.js";
// import chatRoutes from "./routes/chat.routes.js";
// import sessionRoutes from "./routes/session.routes.js";

// import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// Enable CORS
app.use(cors());

// Logging (dev friendly)
app.use(morgan("dev"));

// Parse JSON body
app.use(express.json({ limit: "10mb" }));

// Parse URL encoded data
app.use(express.urlencoded({ extended: true }));

/* ---------- Health Check ---------- */
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running 🚀",
  });
});

/* ---------- Routes ---------- */
// app.use("/api/auth", authRoutes);       // login / register
// app.use("/api/guest", guestRoutes);     // guest start / clear
// app.use("/api/chat", chatRoutes);       // chat messages
// app.use("/api/sessions", sessionRoutes);// chat windows

/* ---------- 404 Handler ---------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

/* ---------- Global Error Handler ---------- */
// app.use(errorHandler);

export default app;
