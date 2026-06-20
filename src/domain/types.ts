export type AgeRange = "18-19" | "20s" | "30s" | "40plus";
export type SkinType = "dry" | "oily" | "combination" | "normal";
export type SkinConcern = "dryness" | "sensitivity" | "acne" | "redness" | "dullness" | "barrier" | "antiAging";
export type SensitivityLevel = "low" | "normal" | "high";

export type ProductCategory =
  | "cleanser"
  | "toner"
  | "essence"
  | "serum"
  | "treatment"
  | "moisturizer"
  | "sunscreen"
  | "mask"
  | "oil"
  | "other";

export type BenefitCategory =
  | "hydration"
  | "barrier"
  | "soothing"
  | "exfoliation"
  | "antioxidant"
  | "brightening"
  | "acneCare"
  | "antiAging"
  | "sunProtection";

export type IngredientFlag =
  | "sensitiveReference"
  | "fragrance"
  | "essentialOil"
  | "dryingAlcohol"
  | "retinoid"
  | "exfoliant"
  | "sunscreenFilter";

export type ProductSource = "ai" | "manual" | "demo";
export type ProductStatus = "active" | "finished";

export interface SkinProfile {
  ageRange: AgeRange;
  skinType: SkinType;
  concerns: SkinConcern[];
  sensitivity: SensitivityLevel;
  avoidedIngredients: string[];
}

export interface IngredientDefinition {
  standardName: string;
  aliases: string[];
  benefits: BenefitCategory[];
  flags: IngredientFlag[];
  descriptionKo: string;
  evidenceLevel: "common" | "limited" | "reference";
  sensitiveSkinNote: boolean;
}

export interface ParsedIngredient {
  originalName: string;
  normalizedName: string;
  standardName: string | null;
  benefits: BenefitCategory[];
  flags: IngredientFlag[];
  matched: boolean;
}

export interface AnalyzerExtraction {
  brand: string | null;
  productName: string | null;
  category: ProductCategory | null;
  rawIngredients: string;
  ingredients: string[];
  extractionConfidence: number;
  unreadableSections: string[];
  detectedLanguages?: string[];
  imageQualityIssues?: string[];
  requiresUserReview?: boolean;
  remoteFallbackNotice?: string;
  source: ProductSource;
  imageUri?: string;
}

export interface ProductAnalysisResult {
  parsedIngredients: ParsedIngredient[];
  benefits: BenefitCategory[];
  concernFlags: SkinConcern[];
  avoidedMatches: string[];
  sensitiveNotes: string[];
  referenceFlags: IngredientFlag[];
  unmatchedCount: number;
  extractionConfidence: number;
  limitations: string[];
  isDemo: boolean;
}

export interface Product {
  id: string;
  brand: string;
  name: string;
  category: ProductCategory;
  rawIngredients: string;
  ingredients: string[];
  benefits: BenefitCategory[];
  concernFlags: SkinConcern[];
  extractionConfidence: number;
  source: ProductSource;
  imageUri?: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  analysis: ProductAnalysisResult;
}

export interface VanityScoreSection {
  label: string;
  score: number;
  maxScore: number;
  reasons: string[];
}

export interface VanityScoreResult {
  total: number;
  sections: VanityScoreSection[];
  duplicates: string[];
  combinationNotes: string[];
  missingBenefits: BenefitCategory[];
  nextAction: string;
}

export interface RoutineItem {
  product: Product;
  reason: string;
}

export interface RoutineAlternative {
  product: Product;
  reason: string;
}

export interface RoutineResult {
  am: RoutineItem[];
  pm: RoutineItem[];
  alternatives: RoutineAlternative[];
  notes: string[];
}

export interface CreatorProfile {
  ageRange: AgeRange;
  skinType: SkinType;
  concerns: SkinConcern[];
}

export interface Creator {
  id: string;
  displayName: string;
  profile: CreatorProfile;
  bio: string;
  feed: string[];
  products: Product[];
}

export type PersonalizedProductLabel =
  | "내 고민과 잘 맞음"
  | "내 화장대의 빈 역할을 채움"
  | "이미 비슷한 역할이 있음"
  | "내 설정상 확인 필요"
  | "중립";

export interface PersonalizedProduct {
  product: Product;
  label: PersonalizedProductLabel;
  score: number;
  reasons: string[];
  purchasePriority: "high" | "normal" | "low" | "avoidCta";
}

export interface AppStateShape {
  schemaVersion: number;
  onboardingComplete: boolean;
  profile: SkinProfile | null;
  products: Product[];
  followedCreatorIds: string[];
  isProPreview: boolean;
  remoteAnalysisConsent: {
    geminiImageTransferAccepted: boolean;
    updatedAt: string | null;
  };
  demoSettings: {
    hasLoadedDemoProfile: boolean;
  };
}
