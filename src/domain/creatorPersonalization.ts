import { benefitLabels } from "../copy/ko";
import { buildCombinationNotes, getActiveProducts } from "./compatibility";
import { concernBenefitMap, getAvoidedMatches } from "./productAnalysis";
import { getMissingBenefits } from "./vanityScore";
import type { PersonalizedProduct, Product, SkinProfile } from "./types";

export function personalizeCreatorProducts(creatorProducts: Product[], myProducts: Product[], profile: SkinProfile): PersonalizedProduct[] {
  const activeMine = getActiveProducts(myProducts);
  const missingBenefits = getMissingBenefits(activeMine, profile);

  return getActiveProducts(creatorProducts)
    .map((product) => personalizeProduct(product, activeMine, profile, missingBenefits))
    .sort((left, right) => {
      if (left.label === "내 설정상 확인 필요" && right.label !== "내 설정상 확인 필요") {
        return -1;
      }
      if (right.label === "내 설정상 확인 필요" && left.label !== "내 설정상 확인 필요") {
        return 1;
      }
      return right.score - left.score;
    });
}

export function personalizeProduct(product: Product, myProducts: Product[], profile: SkinProfile, missingBenefits: ReturnType<typeof getMissingBenefits>): PersonalizedProduct {
  const avoidedMatches = getAvoidedMatches(product.ingredients, profile.avoidedIngredients);
  const hypotheticalNotes = buildCombinationNotes([...myProducts, product], profile).filter((note) => note.productIds.includes(product.id));
  const fillsMissing = product.benefits.some((benefit) => missingBenefits.includes(benefit));
  const similar = myProducts.some((mine) => mine.category === product.category && mine.benefits.some((benefit) => product.benefits.includes(benefit)));
  const concernMatch = profile.concerns.some((concern) => concernBenefitMap[concern].some((benefit) => product.benefits.includes(benefit)));

  let label: PersonalizedProduct["label"] = "중립";
  const reasons: string[] = [];
  if (avoidedMatches.length > 0 || hypotheticalNotes.some((note) => note.level === "strongPreference")) {
    label = "내 설정상 확인 필요";
    reasons.push(`피하고 싶은 성분 설정과 일치: ${avoidedMatches.join(", ") || "조합 참고"}`);
  } else if (fillsMissing) {
    label = "내 화장대의 빈 역할을 채움";
    reasons.push(`현재 부족한 ${product.benefits.map((benefit) => benefitLabels[benefit]).join(", ")} 역할을 채워요.`);
  } else if (similar) {
    label = "이미 비슷한 역할이 있음";
    reasons.push("내 화장대에 같은 카테고리와 주요 기능이 비슷한 제품이 있어요.");
  } else if (concernMatch) {
    label = "내 고민과 잘 맞음";
    reasons.push("내 피부 고민과 제품의 주요 기능이 연결돼요.");
  } else {
    reasons.push("현재 프로필 기준으로 특별히 우선하거나 제외할 이유가 크지 않아요.");
  }

  for (const note of hypotheticalNotes) {
    reasons.push(note.message);
  }

  const score = calculateProfileMatchScore({ concernMatch, fillsMissing, needsCheck: label === "내 설정상 확인 필요", similar });
  return {
    product,
    label,
    score,
    reasons,
    purchasePriority: label === "내 설정상 확인 필요" ? "avoidCta" : fillsMissing ? "high" : similar ? "low" : "normal"
  };
}

export function calculateProfileMatchScore(input: {
  concernMatch: boolean;
  fillsMissing: boolean;
  needsCheck: boolean;
  similar: boolean;
}): number {
  let score = 50;
  if (input.concernMatch) {
    score += 30;
  }
  if (input.fillsMissing) {
    score += 15;
  }
  if (input.needsCheck) {
    score -= 25;
  }
  if (input.similar) {
    score -= 10;
  }
  return Math.min(100, Math.max(0, score));
}
