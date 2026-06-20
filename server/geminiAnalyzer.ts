import { GoogleGenAI, Type } from "@google/genai";
import type { AnalyzeProductRequest, AnalyzerExtractionResponse } from "./schemas";
import { analyzerExtractionSchema } from "./schemas";

const instruction =
  "제품 앞면과 전성분표 이미지에서 보이는 정보만 추출하라. 읽을 수 없는 정보는 추측하지 말고 null, 빈 배열 또는 unreadableSections에 기록하라. 전성분 순서를 유지하라. 제품의 안전성, 효능 또는 적합성을 판단하지 마라.";

export async function analyzeWithGemini(request: AnalyzeProductRequest, apiKey: string, model: string): Promise<AnalyzerExtractionResponse> {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${instruction}\n입력 힌트: ${request.hint}\n이미지 URI는 로컬 개발 힌트일 뿐이며 접근할 수 없으면 unreadableSections에 기록하라.`
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          brand: { type: Type.STRING, nullable: true },
          productName: { type: Type.STRING, nullable: true },
          category: {
            type: Type.STRING,
            nullable: true,
            enum: ["cleanser", "toner", "essence", "serum", "treatment", "moisturizer", "sunscreen", "mask", "oil", "other"]
          },
          rawIngredients: { type: Type.STRING },
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          extractionConfidence: { type: Type.NUMBER },
          unreadableSections: { type: Type.ARRAY, items: { type: Type.STRING } },
          source: { type: Type.STRING, enum: ["ai"] }
        },
        required: ["brand", "productName", "category", "rawIngredients", "ingredients", "extractionConfidence", "unreadableSections", "source"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }
  const parsedJson = JSON.parse(text) as unknown;
  const parsed = analyzerExtractionSchema.safeParse(parsedJson);
  if (!parsed.success) {
    throw new Error("Gemini response did not match analyzer schema");
  }
  return parsed.data;
}
