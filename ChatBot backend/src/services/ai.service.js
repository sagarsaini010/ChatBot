import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateAIReply = async (context) => {
  try {
    console.log("AI CONTEXT:", JSON.stringify(context, null, 2));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: context,
    });

    console.log("AI RAW RESPONSE:", response);

    return response.text;
  } catch (error) {
    console.error("GEMINI FULL ERROR:", error);
    throw error; // original error throw karo
  }
};

