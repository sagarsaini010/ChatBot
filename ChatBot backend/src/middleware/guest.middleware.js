import { v4 as uuidv4 } from "uuid";

/**
 * Guest Middleware
 * - Allows users to use chatbot without login
 * - Creates / validates guestId
 * - Attaches guestId to request
 */
export const guestMiddleware = (req, res, next) => {
  try {
    // 1️⃣ Header se guestId lo
    let guestId = req.headers["x-guest-id"];

    // 2️⃣ Agar guestId nahi mila → naya banao
    if (!guestId) {
      guestId = `guest_${uuidv4()}`;
    }

    // 3️⃣ Request object pe attach karo
    req.guestId = guestId;

    // 4️⃣ Frontend ko guestId wapas bhejo (for persistence)
    res.setHeader("x-guest-id", guestId);

    next(); // request ko aage bhejo
  } catch (error) {
    next(error);
  }
};
