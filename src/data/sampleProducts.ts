import type { AnalyzerExtraction, Product } from "../domain/types";
import { createProductFromExtraction } from "../domain/productAnalysis";

export const sampleExtractions: Record<"hydration" | "barrier" | "retinol" | "sunscreen" | "cleanser" | "salicylic" | "lactic", AnalyzerExtraction> = {
  hydration: {
    brand: "데모랩",
    productName: "수분 진정 세럼",
    category: "serum",
    rawIngredients: "Water, Glycerin, Butylene Glycol, Niacinamide, Sodium Hyaluronate, Panthenol, Allantoin",
    ingredients: ["Water", "Glycerin", "Butylene Glycol", "Niacinamide", "Sodium Hyaluronate", "Panthenol", "Allantoin"],
    extractionConfidence: 1,
    unreadableSections: [],
    source: "demo"
  },
  barrier: {
    brand: "데모랩",
    productName: "장벽 크림",
    category: "moisturizer",
    rawIngredients: "Water, Glycerin, Squalane, Ceramide NP, Cholesterol, Panthenol, Dimethicone",
    ingredients: ["Water", "Glycerin", "Squalane", "Ceramide NP", "Cholesterol", "Panthenol", "Dimethicone"],
    extractionConfidence: 1,
    unreadableSections: [],
    source: "demo"
  },
  retinol: {
    brand: "데모랩",
    productName: "레티놀 세럼",
    category: "treatment",
    rawIngredients: "Water, Glycerin, Squalane, Retinol, Tocopherol, Fragrance",
    ingredients: ["Water", "Glycerin", "Squalane", "Retinol", "Tocopherol", "Fragrance"],
    extractionConfidence: 1,
    unreadableSections: [],
    source: "demo"
  },
  sunscreen: {
    brand: "선데모",
    productName: "데일리 선스크린",
    category: "sunscreen",
    rawIngredients: "Water, Glycerin, Zinc Oxide, Ethylhexyl Methoxycinnamate, Tocopherol",
    ingredients: ["Water", "Glycerin", "Zinc Oxide", "Ethylhexyl Methoxycinnamate", "Tocopherol"],
    extractionConfidence: 1,
    unreadableSections: [],
    source: "demo"
  },
  cleanser: {
    brand: "클린데모",
    productName: "약산성 클렌저",
    category: "cleanser",
    rawIngredients: "Water, Glycerin, Allantoin, Green Tea Extract",
    ingredients: ["Water", "Glycerin", "Allantoin", "Green Tea Extract"],
    extractionConfidence: 1,
    unreadableSections: [],
    source: "demo"
  },
  salicylic: {
    brand: "포어데모",
    productName: "살리실릭 토너",
    category: "toner",
    rawIngredients: "Water, Glycerin, Salicylic Acid, Zinc PCA, Alcohol Denat.",
    ingredients: ["Water", "Glycerin", "Salicylic Acid", "Zinc PCA", "Alcohol Denat."],
    extractionConfidence: 1,
    unreadableSections: [],
    source: "demo"
  },
  lactic: {
    brand: "글로우데모",
    productName: "락틱 애씨드 패드",
    category: "treatment",
    rawIngredients: "Water, Glycerin, Lactic Acid, Niacinamide, Green Tea Extract",
    ingredients: ["Water", "Glycerin", "Lactic Acid", "Niacinamide", "Green Tea Extract"],
    extractionConfidence: 1,
    unreadableSections: [],
    source: "demo"
  }
};

export function createDemoProduct(key: keyof typeof sampleExtractions, idPrefix = "sample"): Product {
  return createProductFromExtraction(sampleExtractions[key], null, `${idPrefix}-${key}`);
}

export const quickSampleKeys: (keyof typeof sampleExtractions)[] = ["hydration", "barrier", "retinol"];

export const manualEmptyExtraction: AnalyzerExtraction = {
  brand: "",
  productName: "",
  category: "serum",
  rawIngredients: "",
  ingredients: [],
  extractionConfidence: 1,
  unreadableSections: [],
  source: "manual"
};
