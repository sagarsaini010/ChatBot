import dotenv from "dotenv";
dotenv.config();

export const env = {
  MONGODB_URI: process.env.MONGODB_URI,
  PORT: process.env.PORT,
  GoogleGenAI_API_KEY: process.env.GoogleGenAI_API_KEY,
};