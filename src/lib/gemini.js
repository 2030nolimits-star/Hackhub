import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure the API key is available in your environment (.env.local preferable)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''; // Replace or set in .env.local

const genAI = new GoogleGenerativeAI(API_KEY);

export const getGeminiModel = (modelName = "gemini-1.5-flash") => {
  return genAI.getGenerativeModel({ model: modelName });
};

// A helper for structured JSON output
export const getGeminiJsonModel = (modelName = "gemini-1.5-flash") => {
    return genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: { responseMimeType: "application/json" }
    });
};
