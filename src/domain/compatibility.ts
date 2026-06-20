import type { Product, SkinProfile } from "./types";

export interface CombinationNote {
  level: "reference" | "strongPreference";
  message: string;
  productIds: string[];
}

export function getActiveProducts(products: Product[]): Product[] {
  return products.filter((product) => product.status === "active");
}

export function hasRetinoid(product: Product): boolean {
  return product.analysis.referenceFlags.includes("retinoid");
}

export function hasExfoliant(product: Product): boolean {
  return product.analysis.referenceFlags.includes("exfoliant");
}

export function hasSensitiveReference(product: Product): boolean {
  return product.analysis.referenceFlags.some((flag) => flag === "fragrance" || flag === "essentialOil" || flag === "dryingAlcohol");
}

export function buildCombinationNotes(products: Product[], profile: SkinProfile | null): CombinationNote[] {
  const active = getActiveProducts(products);
  const retinoids = active.filter(hasRetinoid);
  const exfoliants = active.filter(hasExfoliant);
  const notes: CombinationNote[] = [];

  if (retinoids.length > 0 && exfoliants.length > 0) {
    notes.push({
      level: "reference",
      message: "레티노이드와 AHA/BHA/PHA 제품은 같은 저녁 루틴보다 번갈아 사용 참고로 분리했어요.",
      productIds: [...retinoids, ...exfoliants].map((product) => product.id)
    });
  }

  const activeExfoliants = exfoliants.slice(1);
  if (activeExfoliants.length > 0) {
    notes.push({
      level: "reference",
      message: "각질 관리 역할의 제품이 여러 개 있어 같은 루틴에는 대표 제품 하나만 배치했어요.",
      productIds: exfoliants.map((product) => product.id)
    });
  }

  const sensitiveProducts = active.filter(hasSensitiveReference);
  if (profile?.sensitivity === "high" && sensitiveProducts.length > 0) {
    notes.push({
      level: "reference",
      message: "민감도가 높게 설정되어 있어 향료, 에센셜 오일, 변성 알코올 계열은 확인 참고로 표시했어요.",
      productIds: sensitiveProducts.map((product) => product.id)
    });
  }

  const avoidedProducts = active.filter((product) => product.analysis.avoidedMatches.length > 0);
  for (const product of avoidedProducts) {
    notes.push({
      level: "strongPreference",
      message: `${product.name}에 피하고 싶은 성분 설정과 일치하는 항목이 있어요: ${product.analysis.avoidedMatches.join(", ")}`,
      productIds: [product.id]
    });
  }

  return notes;
}
