
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { AIResponse, Intent, SessionContext } from "../types";

export async function processChat(
  userInput: string, 
  history: { role: 'user' | 'assistant', content: string }[],
  context: SessionContext
): Promise<AIResponse> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Session Context: Department: ${context.department || 'Unknown'}, Level: ${context.level || 'Unknown'}
    User Message: ${userInput}
    
    Previous History Summary: ${JSON.stringify(history.slice(-6))}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING },
            intent: { 
              type: Type.STRING,
              description: "One of COURSE_INFO, MATERIAL_SEARCH, PAST_QUESTIONS, STUDY_ADVICE, GENERAL_CHAT, SET_CONTEXT"
            },
            parameters: {
              type: Type.OBJECT,
              properties: {
                department: { type: Type.STRING },
                level: { type: Type.STRING },
                courseCode: { type: Type.STRING }
              }
            }
          },
          required: ["answer", "intent"]
        }
      }
    });

    const text = response.text || "";
    try {
      return JSON.parse(text) as AIResponse;
    } catch (parseError) {
      console.warn("JSON Parse Fallback triggered", parseError);
      // Fallback for malformed JSON
      return {
        answer: text.replace(/```json|```/g, '').trim() || "I understood your request but had trouble formatting the response. Could you try again?",
        intent: Intent.GENERAL_CHAT,
        parameters: {}
      };
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error; // Let the UI handle the error state
  }
}
