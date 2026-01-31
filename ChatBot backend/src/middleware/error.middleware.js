export const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err);

  // Default values
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal Server Error";

  /* ------------------ MongoDB Errors ------------------ */

  // Invalid ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  /* ------------------ JWT Errors ------------------ */

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token, please login again";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Session expired, please login again";
  }

  /* ------------------ Gemini / External API Errors ------------------ */

  if (err.name === "ApiError") {
    statusCode = err.status || 503;

    if (statusCode === 503) {
      message = "AI service is busy. Please try again later.";
    } else if (statusCode === 403) {
      message = "AI access denied. Check API key.";
    } else {
      message = err.message || "AI service error";
    }
  }

  /* ------------------ Response ------------------ */

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};
