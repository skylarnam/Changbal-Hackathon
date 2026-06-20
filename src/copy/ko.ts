import type { AgeRange, BenefitCategory, ProductCategory, SensitivityLevel, SkinConcern, SkinType } from "../domain/types";

export const MEDICAL_REFERENCE_NOTICE =
  "전성분과 입력한 피부 프로필을 바탕으로 제공되는 참고 정보예요. 실제 반응은 성분 농도, 제형, 사용량과 개인 상태에 따라 달라질 수 있어요.";

export const VANITY_SCORE_NOTICE =
  "제품 구성의 균형을 이해하기 위한 참고 점수이며 피부 건강이나 의학적 상태를 평가하지 않아요.";

export const PERSONALIZED_SCORE_NOTICE =
  "프로필과 현재 화장대를 기준으로 계산한 참고 점수이며 실제 피부 반응을 예측하지 않아요.";

export const AFFILIATE_NOTICE = "이 링크를 통한 구매 시 화장대 주인과 플랫폼이 수수료를 받을 수 있어요.";

export const ageRangeLabels: Record<AgeRange, string> = {
  "14-19": "만 14~19세",
  "20s": "20대",
  "30s": "30대",
  "40plus": "40대 이상"
};

export const skinTypeLabels: Record<SkinType, string> = {
  dry: "건성",
  oily: "지성",
  combination: "복합성",
  normal: "중성"
};

export const concernLabels: Record<SkinConcern, string> = {
  dryness: "건조함",
  sensitivity: "민감함",
  acne: "트러블·피지",
  redness: "붉은기",
  dullness: "칙칙함",
  barrier: "피부 장벽",
  antiAging: "탄력·노화 관리"
};

export const sensitivityLabels: Record<SensitivityLevel, string> = {
  low: "낮음",
  normal: "보통",
  high: "높음"
};

export const categoryLabels: Record<ProductCategory, string> = {
  cleanser: "클렌저",
  toner: "토너",
  essence: "에센스",
  serum: "세럼",
  treatment: "트리트먼트",
  moisturizer: "크림·보습제",
  sunscreen: "선스크린",
  mask: "마스크",
  oil: "오일",
  other: "기타"
};

export const benefitLabels: Record<BenefitCategory, string> = {
  hydration: "보습",
  barrier: "장벽",
  soothing: "진정",
  exfoliation: "각질 관리 참고",
  antioxidant: "항산화",
  brightening: "톤 관리 참고",
  acneCare: "피지 관리 참고",
  antiAging: "탄력 관리 참고",
  sunProtection: "자외선 차단"
};

export const ageRanges: AgeRange[] = ["14-19", "20s", "30s", "40plus"];
export const skinTypes: SkinType[] = ["dry", "oily", "combination", "normal"];
export const sensitivityLevels: SensitivityLevel[] = ["low", "normal", "high"];
export const skinConcerns: SkinConcern[] = ["dryness", "sensitivity", "acne", "redness", "dullness", "barrier", "antiAging"];
export const productCategories: ProductCategory[] = [
  "cleanser",
  "toner",
  "essence",
  "serum",
  "treatment",
  "moisturizer",
  "sunscreen",
  "mask",
  "oil",
  "other"
];
