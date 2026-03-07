import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY : ""});


export async function reviewCode(fileContent: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fileContent,
      config: {
        systemInstruction: `You are a senior software engineer reviewing a pull request.
        Analyze the following code changes and provide:
    - Potential bugs
    - Risky patterns  
    - Suggestions for improvement`
    }
  });
    return response.text ? response.text : "";
  } catch (error) {
    console.error("Gemini API error:", error);
    return "Review unavailable — API quota exceeded.";
  }
}
