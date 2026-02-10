import express from "express";
import cors from "cors";
import morgan from "morgan";
import titleRoutes from "./routes/title.routes.js";
import authRoutes from "./routes/auth.routes.js";
// import guestRoutes from "./routes/guest.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// Enable CORS
app.use(cors());

app.use(morgan("dev"));

app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running 🚀",
  });
});

/* ---------- Routes ---------- */
app.use("/api/auth", authRoutes);       // login / register
// app.use("/api/guest", guestRoutes);  // guest start / clear
app.use("/api/chat", chatRoutes);       // chat messages
app.use("/api/sessions", sessionRoutes);// chat windows
app.use("/api/title", titleRoutes);     // title generation

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});


app.use(errorHandler);

export default app;
