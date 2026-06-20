import { categoryLabels } from "../copy/ko";
import { getActiveProducts, hasExfoliant, hasRetinoid } from "./compatibility";
import { getProductPrimaryBenefit } from "./productAnalysis";
import type { Product, ProductCategory, RoutineAlternative, RoutineItem, RoutineResult, SkinProfile } from "./types";

const amOrder: ProductCategory[] = ["cleanser", "toner", "essence", "serum", "treatment", "moisturizer", "sunscreen"];
const pmOrder: ProductCategory[] = ["cleanser", "toner", "essence", "serum", "treatment", "moisturizer", "oil"];

export function generateRoutine(products: Product[], profile: SkinProfile | null): RoutineResult {
  const active = getActiveProducts(products);
  const notes: string[] = [];
  const alternatives: RoutineAlternative[] = [];
  if (active.some(hasRetinoid) && active.some(hasExfoliant)) {
    notes.push("레티노이드와 각질 관리 제품은 같은 PM 루틴에 동시에 넣지 않았어요.");
  }

  const am = pickRoutine(active, amOrder, "am", alternatives, notes, profile);
  const pm = pickRoutine(active, pmOrder, "pm", alternatives, notes, profile);

  const pmRetinoid = pm.find((item) => hasRetinoid(item.product));
  const pmExfoliant = pm.find((item) => hasExfoliant(item.product));
  if (pmRetinoid && pmExfoliant) {
    const removeId = pmExfoliant.product.id;
    const filteredPm = pm.filter((item) => item.product.id !== removeId);
    alternatives.push({
      product: pmExfoliant.product,
      reason: "레티노이드와 같은 저녁 루틴에는 넣지 않고 번갈아 사용 참고로 분리했어요."
    });
    return { am, pm: filteredPm, alternatives, notes };
  }

  if (active.length === 0) {
    notes.push("현재 제품이 없어 루틴을 만들 수 없어요.");
  }

  return { am, pm, alternatives, notes };
}

function pickRoutine(
  products: Product[],
  order: ProductCategory[],
  time: "am" | "pm",
  alternatives: RoutineAlternative[],
  notes: string[],
  profile: SkinProfile | null
): RoutineItem[] {
  const selected: RoutineItem[] = [];
  const usedBenefitKeys = new Set<string>();
  let exfoliantAlreadySelected = false;

  for (const category of order) {
    let candidates = products.filter((product) => product.category === category);
    if (time === "am") {
      candidates = candidates.filter((product) => !hasRetinoid(product) && product.category !== "oil");
    }
    if (time === "pm") {
      candidates = candidates.filter((product) => product.category !== "sunscreen");
    }
    if (category === "sunscreen" && time === "am") {
      candidates = products.filter((product) => product.category === "sunscreen" || product.benefits.includes("sunProtection"));
    }

    for (const candidate of candidates) {
      if (hasExfoliant(candidate) && exfoliantAlreadySelected) {
        alternatives.push({ product: candidate, reason: "각질 관리 제품은 같은 루틴에서 하나만 선택했어요." });
        continue;
      }
      const primaryBenefit = getProductPrimaryBenefit(candidate) ?? "none";
      const roleKey = `${category}:${primaryBenefit}`;
      if (usedBenefitKeys.has(roleKey)) {
        alternatives.push({
          product: candidate,
          reason: `${categoryLabels[category]} 단계에서 비슷한 주요 기능이 있어 대체 제품으로 분리했어요.`
        });
        continue;
      }
      usedBenefitKeys.add(roleKey);
      if (hasExfoliant(candidate)) {
        exfoliantAlreadySelected = true;
      }
      selected.push({
        product: candidate,
        reason: buildRoutineReason(candidate, time, profile)
      });
      break;
    }
  }

  if (time === "am") {
    selected.sort((left, right) => amOrder.indexOf(left.product.category) - amOrder.indexOf(right.product.category));
  } else {
    selected.sort((left, right) => pmOrder.indexOf(left.product.category) - pmOrder.indexOf(right.product.category));
  }

  if (time === "pm" && selected.some((item) => hasRetinoid(item.product))) {
    notes.push("레티노이드 계열은 PM 루틴에만 배치했어요.");
  }

  return selected;
}

function buildRoutineReason(product: Product, time: "am" | "pm", profile: SkinProfile | null): string {
  if (product.category === "sunscreen") {
    return "자외선 차단 단계라 AM 마지막에 배치했어요.";
  }
  if (hasRetinoid(product)) {
    return "레티노이드 계열이라 PM 루틴에 배치했어요.";
  }
  if (product.category === "cleanser") {
    return `${time === "am" ? "아침" : "저녁"} 첫 단계로 배치했어요.`;
  }
  const matchedConcern = profile?.concerns.find((concern) => product.concernFlags.includes(concern));
  if (matchedConcern) {
    return "내 피부 고민과 연결되는 기능이 있어 선택했어요.";
  }
  return "현재 보유 제품 중 이 단계의 대표 제품으로 선택했어요.";
}
