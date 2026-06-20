import { benefitLabels } from "../copy/ko";
import type {
  AnalyzerExtraction,
  BenefitCategory,
  Product,
  ProductAnalysisResult,
  ProductCategory,
  SkinConcern,
  SkinProfile
} from "./types";
import { collectIngredientFlags, matchIngredientName, parseIngredients, splitRawIngredients, uniqueFlatMap } from "./ingredientParser";

export const concernBenefitMap: Record<SkinConcern, BenefitCategory[]> = {
  dryness: ["hydration", "barrier"],
  sensitivity: ["soothing", "barrier"],
  acne: ["acneCare", "exfoliation"],
  redness: ["soothing"],
  dullness: ["brightening", "antioxidant"],
  barrier: ["barrier"],
  antiAging: ["antiAging", "antioxidant"]
};

export function analyzeProduct(extraction: AnalyzerExtraction, profile: SkinProfile | null): ProductAnalysisResult {
  const ingredientsInput = extraction.ingredients.length > 0 ? extraction.ingredients : splitRawIngredients(extraction.rawIngredients);
  const parsedIngredients = parseIngredients(ingredientsInput);
  const benefits = uniqueFlatMap(parsedIngredients, (ingredient) => ingredient.benefits);
  const referenceFlags = collectIngredientFlags(parsedIngredients);
  const concernFlags = getConcernFlags(benefits, profile);
  const avoidedMatches = getAvoidedMatches(parsedIngredients.map((item) => item.originalName), profile?.avoidedIngredients ?? []);
  const sensitiveNotes = buildSensitiveNotes(referenceFlags, profile);
  const unmatchedCount = parsedIngredients.filter((ingredient) => !ingredient.matched).length;
  const limitations = [
    "성분 농도와 제형은 알 수 없어 기능 강도를 단정하지 않아요.",
    "제품 효능이나 피부 반응을 보장하지 않아요.",
    ...extraction.unreadableSections.map((section) => `읽기 어려운 영역: ${section}`)
  ];

  return {
    parsedIngredients,
    benefits,
    concernFlags,
    avoidedMatches,
    sensitiveNotes,
    referenceFlags,
    unmatchedCount,
    extractionConfidence: clamp(extraction.extractionConfidence, 0, 1),
    limitations,
    isDemo: extraction.source === "demo"
  };
}

export function createProductFromExtraction(extraction: AnalyzerExtraction, profile: SkinProfile | null, id = createId()): Product {
  const analysis = analyzeProduct(extraction, profile);
  const now = new Date().toISOString();
  return {
    id,
    brand: extraction.brand?.trim() || "브랜드 미상",
    name: extraction.productName?.trim() || "이름 미상 제품",
    category: extraction.category ?? inferCategoryFromBenefits(analysis.benefits),
    rawIngredients: extraction.rawIngredients,
    ingredients: analysis.parsedIngredients.map((ingredient) => ingredient.originalName),
    benefits: analysis.benefits,
    concernFlags: analysis.concernFlags,
    extractionConfidence: analysis.extractionConfidence,
    source: extraction.source,
    imageUri: extraction.imageUri,
    status: "active",
    createdAt: now,
    updatedAt: now,
    analysis
  };
}

export function getConcernFlags(benefits: BenefitCategory[], profile: SkinProfile | null): SkinConcern[] {
  if (!profile) {
    return [];
  }
  return profile.concerns.filter((concern) => concernBenefitMap[concern].some((benefit) => benefits.includes(benefit)));
}

export function getAvoidedMatches(ingredientNames: string[], avoidedIngredients: string[]): string[] {
  const normalizedAvoided = avoidedIngredients
    .map((ingredient) => ({
      input: ingredient.trim(),
      definition: matchIngredientName(ingredient),
      normalized: ingredient.trim().toLowerCase()
    }))
    .filter((ingredient) => ingredient.input.length > 0);

  const matches = new Set<string>();
  for (const ingredientName of ingredientNames) {
    const definition = matchIngredientName(ingredientName);
    const normalizedName = ingredientName.trim().toLowerCase();
    for (const avoided of normalizedAvoided) {
      if (avoided.definition && definition && avoided.definition.standardName === definition.standardName) {
        matches.add(avoided.input);
      } else if (normalizedName === avoided.normalized) {
        matches.add(avoided.input);
      }
    }
  }
  return Array.from(matches);
}

export function getProductPrimaryBenefit(product: Pick<Product, "benefits">): BenefitCategory | null {
  return product.benefits[0] ?? null;
}

export function formatBenefits(benefits: BenefitCategory[]): string {
  return benefits.length > 0 ? benefits.map((benefit) => benefitLabels[benefit]).join(", ") : "매칭된 주요 기능 없음";
}

function buildSensitiveNotes(referenceFlags: ReturnType<typeof collectIngredientFlags>, profile: SkinProfile | null): string[] {
  const notes: string[] = [];
  if (profile?.sensitivity === "high" && referenceFlags.includes("fragrance")) {
    notes.push("민감도가 높게 설정되어 있어 향료 포함 여부를 확인해보세요.");
  }
  if (profile?.sensitivity === "high" && referenceFlags.includes("essentialOil")) {
    notes.push("민감도가 높게 설정되어 있어 에센셜 오일 계열을 확인해보세요.");
  }
  if ((profile?.sensitivity === "high" || profile?.concerns.includes("dryness")) && referenceFlags.includes("dryingAlcohol")) {
    notes.push("건조함 또는 민감도 설정과 함께 변성 알코올 계열을 확인해보세요.");
  }
  if (profile?.sensitivity === "high" && referenceFlags.includes("exfoliant")) {
    notes.push("민감도가 높다면 각질 관리 성분은 사용 빈도를 천천히 조절해보세요.");
  }
  if (profile?.sensitivity === "high" && referenceFlags.includes("retinoid")) {
    notes.push("민감도가 높다면 레티노이드 계열은 저녁 루틴에서 천천히 참고해보세요.");
  }
  return notes;
}

function inferCategoryFromBenefits(benefits: BenefitCategory[]): ProductCategory {
  if (benefits.includes("sunProtection")) {
    return "sunscreen";
  }
  if (benefits.includes("antiAging") || benefits.includes("exfoliation")) {
    return "treatment";
  }
  if (benefits.includes("barrier")) {
    return "moisturizer";
  }
  if (benefits.length > 0) {
    return "serum";
  }
  return "other";
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
