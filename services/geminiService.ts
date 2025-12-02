import { GoogleGenAI, Type } from "@google/genai";
import { AiAnalysisResult, EmergencyType } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeEmergency = async (text: string): Promise<AiAnalysisResult> => {
  if (!apiKey) {
    console.warn("API Key is missing, returning mock response");
    return {
        category: EmergencyType.GENERAL,
        severity: 'MEDIUM',
        advice: 'API Key missing. Please ensure safety first.',
        summary: text
    };
  }

  try {
    const prompt = `
      Analyze the following emergency situation description in Thai: "${text}".
      Classify it into one of these categories: MEDICAL, POLICE, FIRE, CAR, GENERAL.
      Determine severity (LOW, MEDIUM, HIGH, CRITICAL).
      Provide short, actionable advice in Thai (under 20 words).
      Provide a very short summary (under 5 words).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, enum: ['MEDICAL', 'POLICE', 'FIRE', 'CAR', 'GENERAL'] },
            severity: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
            advice: { type: Type.STRING },
            summary: { type: Type.STRING }
          },
          required: ['category', 'severity', 'advice', 'summary']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result as AiAnalysisResult;

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      category: EmergencyType.GENERAL,
      severity: 'MEDIUM',
      advice: 'ติดต่อเจ้าหน้าที่ทันทีหากรู้สึกไม่ปลอดภัย',
      summary: 'ไม่สามารถวิเคราะห์ได้'
    };
  }
};