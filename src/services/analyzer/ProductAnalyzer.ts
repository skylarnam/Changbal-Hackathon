import { z } from "zod";
import type { AnalyzerExtraction } from "../../domain/types";
import { sampleExtractions } from "../../data/sampleProducts";

export interface AnalyzeImageInput {
  imageUri?: string;
  hint: "front" | "ingredients";
}

export interface ProductAnalyzer {
  extractFromImage(input: AnalyzeImageInput): Promise<AnalyzerExtraction>;
}

const extractionSchema = z.object({
  brand: z.string().nullable(),
  productName: z.string().nullable(),
  category: z.enum(["cleanser", "toner", "essence", "serum", "treatment", "moisturizer", "sunscreen", "mask", "oil", "other"]).nullable(),
  rawIngredients: z.string(),
  ingredients: z.array(z.string()),
  extractionConfidence: z.number().min(0).max(1),
  unreadableSections: z.array(z.string()),
  source: z.enum(["ai", "manual", "demo"])
});

export class MockProductAnalyzer implements ProductAnalyzer {
  async extractFromImage(input: AnalyzeImageInput): Promise<AnalyzerExtraction> {
    if (input.hint === "front") {
      return {
        brand: "이미지 데모",
        productName: "제품명 초안",
        category: null,
        rawIngredients: "",
        ingredients: [],
        extractionConfidence: 0.45,
        unreadableSections: ["전성분표가 없어 성분을 추출하지 않았어요."],
        source: "demo",
        imageUri: input.imageUri
      };
    }
    return {
      ...sampleExtractions.hydration,
      brand: "이미지 데모",
      productName: "전성분표 데모 추출",
      extractionConfidence: 0.72,
      unreadableSections: ["실제 OCR이 아닌 데모 분석 결과예요."],
      imageUri: input.imageUri
    };
  }
}

export class RemoteProductAnalyzer implements ProductAnalyzer {
  constructor(private readonly apiUrl: string) {}

  async extractFromImage(input: AnalyzeImageInput): Promise<AnalyzerExtraction> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(`${this.apiUrl.replace(/\/$/, "")}/analyze-product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input),
        signal: controller.signal
      });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`분석 프록시 오류 ${response.status}: ${detail}`);
      }
      const json = await response.json();
      const parsed = extractionSchema.safeParse(json);
      if (!parsed.success) {
        throw new Error("분석 프록시 응답 형식이 올바르지 않아요.");
      }
      return {
        ...parsed.data,
        source: "ai",
        imageUri: input.imageUri
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function getConfiguredAnalyzer(): ProductAnalyzer {
  const mode = process.env.EXPO_PUBLIC_ANALYZER_MODE;
  if (mode === "remote") {
    return new RemoteProductAnalyzer(process.env.EXPO_PUBLIC_ANALYSIS_API_URL || "http://10.0.2.2:8787");
  }
  return new MockProductAnalyzer();
}
