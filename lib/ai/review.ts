import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY : ""});

export async function reviewCode(fileContent: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents:fileContent, 
    config: {
      systemInstruction: `You are a senior software engineer reviewing a pull request.
Analyze the following code changes and provide:
- Potential bugs
- Risky patterns  
- Suggestions for improvement`
    }
  });
  return response.text ? response.text : "";;
}