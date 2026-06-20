import type { Creator } from "../domain/types";
import { createProductFromExtraction } from "../domain/productAnalysis";
import { sampleExtractions } from "./sampleProducts";

const creatorOneProducts = [
  createProductFromExtraction(
    {
      brand: "데모틴",
      productName: "피지 밸런스 클렌저",
      category: "cleanser",
      rawIngredients: "Water, Glycerin, Green Tea Extract, Allantoin",
      ingredients: ["Water", "Glycerin", "Green Tea Extract", "Allantoin"],
      extractionConfidence: 1,
      unreadableSections: [],
      source: "demo"
    },
    null,
    "creator-1-cleanser"
  ),
  createProductFromExtraction(sampleExtractions.salicylic, null, "creator-1-salicylic"),
  createProductFromExtraction(sampleExtractions.hydration, null, "creator-1-hydration"),
  createProductFromExtraction(sampleExtractions.sunscreen, null, "creator-1-sunscreen")
];

const creatorTwoProducts = [
  createProductFromExtraction(sampleExtractions.cleanser, null, "creator-2-cleanser"),
  createProductFromExtraction(sampleExtractions.barrier, null, "creator-2-barrier"),
  createProductFromExtraction(sampleExtractions.lactic, null, "creator-2-lactic"),
  createProductFromExtraction(
    {
      brand: "톤데모",
      productName: "나이아신 톤 세럼",
      category: "serum",
      rawIngredients: "Water, Niacinamide, Tranexamic Acid, Panthenol, Fragrance",
      ingredients: ["Water", "Niacinamide", "Tranexamic Acid", "Panthenol", "Fragrance"],
      extractionConfidence: 1,
      unreadableSections: [],
      source: "demo"
    },
    null,
    "creator-2-brightening"
  )
];

const creatorThreeProducts = [
  createProductFromExtraction(sampleExtractions.cleanser, null, "creator-3-cleanser"),
  createProductFromExtraction(sampleExtractions.retinol, null, "creator-3-retinol"),
  createProductFromExtraction(
    {
      brand: "리프트데모",
      productName: "펩타이드 크림",
      category: "moisturizer",
      rawIngredients: "Water, Glycerin, Shea Butter, Peptide, Adenosine, Tocopherol",
      ingredients: ["Water", "Glycerin", "Shea Butter", "Peptide", "Adenosine", "Tocopherol"],
      extractionConfidence: 1,
      unreadableSections: [],
      source: "demo"
    },
    null,
    "creator-3-peptide"
  ),
  createProductFromExtraction(
    {
      brand: "오일데모",
      productName: "스쿠알란 페이스 오일",
      category: "oil",
      rawIngredients: "Squalane, Tocopherol",
      ingredients: ["Squalane", "Tocopherol"],
      extractionConfidence: 1,
      unreadableSections: [],
      source: "demo"
    },
    null,
    "creator-3-oil"
  )
];

export const creators: Creator[] = [
  {
    id: "creator-1",
    displayName: "민서의 데모 화장대",
    profile: {
      ageRange: "18-19",
      skinType: "oily",
      concerns: ["acne", "sensitivity"]
    },
    bio: "데모 데이터: 피지와 민감함을 기준으로 구성한 공개 화장대예요.",
    feed: ["새 제품을 화장대에 추가했어요", "아침 루틴을 공개했어요"],
    products: creatorOneProducts
  },
  {
    id: "creator-2",
    displayName: "하린의 데모 화장대",
    profile: {
      ageRange: "20s",
      skinType: "combination",
      concerns: ["dullness", "barrier"]
    },
    bio: "데모 데이터: 톤 관리와 장벽 케어 흐름을 보여줘요.",
    feed: ["장벽 케어 화장대를 업데이트했어요", "새 제품을 화장대에 추가했어요"],
    products: creatorTwoProducts
  },
  {
    id: "creator-3",
    displayName: "서윤의 데모 화장대",
    profile: {
      ageRange: "30s",
      skinType: "dry",
      concerns: ["antiAging", "dryness"]
    },
    bio: "데모 데이터: 건조함과 탄력 관리를 기준으로 구성했어요.",
    feed: ["저녁 루틴을 공개했어요", "장벽 케어 화장대를 업데이트했어요"],
    products: creatorThreeProducts
  }
];
