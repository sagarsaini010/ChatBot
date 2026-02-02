import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    next(); // No token, proceed as guest
    return;
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: "Invalid or expired token" });
    }
    req.user = user;
    req.userId = user.userId;
    console.log("Authenticated user:", req.user);
    console.log("Authenticated userId:", req.userId);
    next();
  });
};
