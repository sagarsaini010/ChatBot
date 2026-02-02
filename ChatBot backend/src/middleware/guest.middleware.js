// import { token } from "morgan";
// import { v4 as uuidv4 } from "uuid";

// /**
//  * Guest Middleware
//  * - Allows users to use chatbot without login
//  * - Creates / validates guestId
//  * - Attaches guestId to request
//  */
// export const guestMiddleware = (req, res, next) => {
//   try {
//     let guestId = req.headers["x-guest-id"];

//     if (token != "null" && token != "undefined") {
//       next(); // If token exists, skip guest middleware and proceed to auth middleware
//       return;
//     }
//     if (!guestId) {
//       guestId = `guest_${uuidv4()}`;
//     }

    
//     req.guestId = guestId;

//     // Frontend ko guestId wapas bhejo (for persistence)
//     res.setHeader("x-guest-id", guestId);

//     next(); 
//   } catch (error) {
//     next(error);
//   }
// };

import { v4 as uuidv4 } from "uuid";

export const guestMiddleware = (req, res, next) => {
  try {
    let guestId = req.headers["x-guest-id"];

    if (!guestId) {
      guestId = `guest_${uuidv4()}`;
      res.setHeader("x-guest-id", guestId);
    }

    req.guestId = guestId;
    next();
  } catch (error) {
    next(error);
  }
};