import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const generateAIReply = async (context) => {
  const safeContext = context
    .filter((m) => m?.parts?.[0]?.text)
    .map((m) => ({
      role: m.role === "model" ? "model" : "user",
      parts: [{ text: m.parts[0].text }],
    }));

  if (!safeContext.length) {
    safeContext.push({
      role: "user",
      parts: [{ text: "Hello" }],
    });
  }

  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: safeContext,
      });

      return response.text;
    } catch (error) {
      const status = error?.status;

      console.error(
        `Gemini error (attempt ${attempt}/${MAX_RETRIES})`,
        status,
        error.message
      );

      // Retry only for overload / internal errors
      if ((status === 500 || status === 503) && attempt < MAX_RETRIES) {
        await sleep(1000 * attempt); // exponential backoff
        continue;
      }

      // Final graceful fallback
      return "⚠️ The AI is busy right now. Please try again in a few moments.";
    }
  }
};
