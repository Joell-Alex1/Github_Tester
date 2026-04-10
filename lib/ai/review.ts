import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
}
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// this function takes the file from api/webhook/route.ts, sends it to the Gemini API with a system instruction to review the code changes and provide feedback. The response from the API is then returned as a string which will be posted as a comment on the pull request.
export async function reviewCode(fileContent: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fileContent,
      config: {
        systemInstruction: `You are a senior software engineer reviewing a pull request.

        Keep your review concise and focused. Only flag:
        - Actual bugs that will cause errors
        - Security risks
        - Critical performance issues

        Skip minor style suggestions and nitpicks.
        Maximum 5 points per file.
        Format your response in clear markdown.`
    }
  });
    return response.text ? response.text : "";
  } catch (error) {
    console.error("Gemini API error:", error);
    return "Review unavailable — API quota exceeded.";
  }
}
