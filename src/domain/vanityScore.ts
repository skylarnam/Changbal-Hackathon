import { benefitLabels, categoryLabels, concernLabels } from "../copy/ko";
import { buildCombinationNotes, getActiveProducts } from "./compatibility";
import { concernBenefitMap } from "./productAnalysis";
import type { BenefitCategory, Product, SkinProfile, VanityScoreResult, VanityScoreSection } from "./types";

export function calculateVanityScore(products: Product[], profile: SkinProfile | null): VanityScoreResult {
  const active = getActiveProducts(products);
  if (active.length === 0) {
    return {
      total: 0,
      sections: [
        { label: "기본 구성", score: 0, maxScore: 40, reasons: ["현재 사용 중인 제품이 없어요."] },
        { label: "고민 기능 커버리지", score: 0, maxScore: 30, reasons: ["프로필과 비교할 제품이 없어요."] },
        { label: "조합 관리", score: 0, maxScore: 15, reasons: ["제품을 추가하면 조합 참고를 계산해요."] },
        { label: "중복 관리", score: 0, maxScore: 15, reasons: ["제품을 추가하면 중복 역할을 계산해요."] }
      ],
      duplicates: [],
      combinationNotes: [],
      missingBenefits: profile ? getMissingBenefits(active, profile) : [],
      nextAction: "먼저 현재 사용하는 제품을 하나 추가해보세요."
    };
  }

  const base = scoreBaseComposition(active);
  const concern = scoreConcernCoverage(active, profile);
  const combinationNotes = buildCombinationNotes(active, profile);
  const combinationPenalty = Math.min(15, uniqueHighNotes(combinationNotes).length * 5);
  const combination: VanityScoreSection = {
    label: "조합 관리",
    score: Math.max(0, 15 - combinationPenalty),
    maxScore: 15,
    reasons: combinationNotes.length > 0 ? combinationNotes.map((note) => note.message) : ["같은 루틴에서 분리할 참고 조합이 없어요."]
  };
  const duplicateInfo = getDuplicateInfo(active);
  const duplicatePenalty = Math.min(15, duplicateInfo.penalty);
  const duplicate: VanityScoreSection = {
    label: "중복 관리",
    score: Math.max(0, 15 - duplicatePenalty),
    maxScore: 15,
    reasons: duplicateInfo.duplicates.length > 0 ? duplicateInfo.duplicates : ["같은 카테고리와 주요 기능이 과하게 겹치지 않아요."]
  };

  const sections = [base, concern, combination, duplicate];
  const total = clamp(Math.round(sections.reduce((sum, section) => sum + section.score, 0)), 0, 100);
  const missingBenefits = profile ? getMissingBenefits(active, profile) : [];

  return {
    total,
    sections,
    duplicates: duplicateInfo.duplicates,
    combinationNotes: combinationNotes.map((note) => note.message),
    missingBenefits,
    nextAction: getNextAction(active, missingBenefits, duplicateInfo.duplicates)
  };
}

export function getMissingBenefits(products: Product[], profile: SkinProfile): BenefitCategory[] {
  const activeBenefits = new Set(products.flatMap((product) => product.benefits));
  const needed = new Set(profile.concerns.flatMap((concern) => concernBenefitMap[concern]));
  if (!products.some((product) => product.category === "sunscreen" || product.benefits.includes("sunProtection"))) {
    needed.add("sunProtection");
  }
  if (!products.some((product) => product.category === "moisturizer" || product.benefits.includes("barrier"))) {
    needed.add("barrier");
  }
  return Array.from(needed).filter((benefit) => !activeBenefits.has(benefit));
}

function scoreBaseComposition(products: Product[]): VanityScoreSection {
  const hasCleanser = products.some((product) => product.category === "cleanser");
  const hasMoisturizerOrBarrier = products.some((product) => product.category === "moisturizer" || product.benefits.includes("barrier"));
  const hasSunscreen = products.some((product) => product.category === "sunscreen" || product.benefits.includes("sunProtection"));
  const score = (hasCleanser ? 8 : 0) + (hasMoisturizerOrBarrier ? 16 : 0) + (hasSunscreen ? 16 : 0);
  const reasons = [
    hasCleanser ? "클렌저 단계가 있어요. +8" : "클렌저 단계가 없어요.",
    hasMoisturizerOrBarrier ? "보습제 또는 장벽 기능 제품이 있어요. +16" : "보습제 또는 장벽 기능 제품이 부족해요.",
    hasSunscreen ? "자외선 차단 단계가 있어요. +16" : "현재 화장대에는 자외선 차단 단계가 없어요."
  ];
  return { label: "기본 구성", score, maxScore: 40, reasons };
}

function scoreConcernCoverage(products: Product[], profile: SkinProfile | null): VanityScoreSection {
  if (!profile || profile.concerns.length === 0) {
    return {
      label: "고민 기능 커버리지",
      score: 0,
      maxScore: 30,
      reasons: ["피부 고민을 설정하면 커버리지를 계산해요."]
    };
  }
  const activeBenefits = new Set(products.flatMap((product) => product.benefits));
  const perConcern = profile.concerns.length === 1 ? 30 : 15;
  let score = 0;
  const reasons = profile.concerns.map((concern) => {
    const matched = concernBenefitMap[concern].some((benefit) => activeBenefits.has(benefit));
    if (matched) {
      score += perConcern;
      return `${concernLabels[concern]} 고민과 연결되는 기능이 있어요. +${perConcern}`;
    }
    return `${concernLabels[concern]} 고민과 연결되는 기능이 부족해요.`;
  });
  return { label: "고민 기능 커버리지", score: clamp(score, 0, 30), maxScore: 30, reasons };
}

function getDuplicateInfo(products: Product[]): { duplicates: string[]; penalty: number } {
  const groups = new Map<string, Product[]>();
  for (const product of products) {
    const primaryBenefit = product.benefits[0] ?? "none";
    const key = `${product.category}:${primaryBenefit}`;
    groups.set(key, [...(groups.get(key) ?? []), product]);
  }

  const duplicates: string[] = [];
  let penalty = 0;
  for (const [key, group] of groups.entries()) {
    if (group.length > 2) {
      const [category, benefit] = key.split(":");
      const extra = group.length - 2;
      penalty += extra * 3;
      duplicates.push(
        `${categoryLabels[category as keyof typeof categoryLabels]}의 ${benefitLabels[benefit as keyof typeof benefitLabels] ?? "유사"} 역할이 ${group.length}개 있어 새 제품 우선순위가 낮아요.`
      );
    }
  }
  return { duplicates, penalty };
}

function uniqueHighNotes(notes: ReturnType<typeof buildCombinationNotes>): string[] {
  return Array.from(new Set(notes.map((note) => note.message)));
}

function getNextAction(products: Product[], missingBenefits: BenefitCategory[], duplicates: string[]): string {
  if (!products.some((product) => product.category === "sunscreen" || product.benefits.includes("sunProtection"))) {
    return "현재 화장대에는 자외선 차단 단계가 없어요.";
  }
  if (missingBenefits.length > 0) {
    return `${benefitLabels[missingBenefits[0]]} 역할을 채우는 제품이 있는지 확인해보세요.`;
  }
  if (duplicates.length > 0) {
    return "겹치는 역할의 제품은 새로 사기보다 사용 순서를 정리해보세요.";
  }
  return "현재 구성은 기본 역할이 잘 채워져 있어요.";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
