import express from "express";
import { setTitle } from "../controllers/title.controller.js";
const router = express.Router();

/** Generate title for a chat session */
router.post("/", setTitle);

export default router;