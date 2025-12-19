
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { AIResponse, Intent, SessionContext } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function processChat(
  userInput: string, 
  history: { role: 'user' | 'assistant', content: string }[],
  context: SessionContext
): Promise<AIResponse> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Session Context: Department: ${context.department || 'Unknown'}, Level: ${context.level || 'Unknown'}
    User Message: ${userInput}
    
    Previous History: ${JSON.stringify(history.slice(-4))}
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

    const result = JSON.parse(response.text) as AIResponse;
    return result;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      answer: "I'm having a bit of trouble processing that. Could you try rephrasing?",
      intent: Intent.GENERAL_CHAT,
      parameters: {}
    };
  }
}
