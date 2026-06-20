import { sampleExtractions } from "../src/data/sampleProducts";
import { parseIngredients, normalizeIngredientName, matchIngredientName } from "../src/domain/ingredientParser";
import { analyzeProduct, createProductFromExtraction } from "../src/domain/productAnalysis";
import { calculateVanityScore } from "../src/domain/vanityScore";
import { generateRoutine } from "../src/domain/routineGenerator";
import { calculateProfileMatchScore, personalizeCreatorProducts } from "../src/domain/creatorPersonalization";
import { creators } from "../src/data/creators";
import { demoProfile } from "../src/state/appReducer";

describe("ingredient parsing and matching", () => {
  test("splits comma, semicolon, and newline separated ingredients", () => {
    const parsed = parseIngredients("Water, Glycerin; Panthenol\nNiacinamide");
    expect(parsed.map((item) => item.originalName)).toEqual(["Water", "Glycerin", "Panthenol", "Niacinamide"]);
  });

  test("normalizes whitespace, case, and symbols", () => {
    expect(normalizeIngredientName("  (Sodium   Hyaluronate) ")).toBe("sodium hyaluronate");
  });

  test("matches aliases including Korean names", () => {
    expect(matchIngredientName("향료")?.standardName).toBe("Fragrance");
    expect(matchIngredientName("소듐 하이알루로네이트")?.standardName).toBe("Sodium Hyaluronate");
  });

  test("creates benefit tags and profile warnings", () => {
    const analysis = analyzeProduct(sampleExtractions.retinol, demoProfile);
    expect(analysis.benefits).toContain("antiAging");
    expect(analysis.avoidedMatches).toContain("향료");
    expect(analysis.sensitiveNotes.join(" ")).toContain("민감도");
  });
});

describe("vanity scoring", () => {
  test("returns zero for empty vanity", () => {
    const score = calculateVanityScore([], demoProfile);
    expect(score.total).toBe(0);
    expect(score.sections[0]?.reasons[0]).toContain("제품이 없어요");
  });

  test("keeps score inside 0 to 100", () => {
    const products = [
      createProductFromExtraction(sampleExtractions.cleanser, demoProfile, "cleanser"),
      createProductFromExtraction(sampleExtractions.barrier, demoProfile, "barrier"),
      createProductFromExtraction(sampleExtractions.sunscreen, demoProfile, "sunscreen")
    ];
    const score = calculateVanityScore(products, demoProfile);
    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(100);
  });

  test("subtracts for duplicate category and primary benefit groups", () => {
    const products = [
      createProductFromExtraction(sampleExtractions.hydration, demoProfile, "hydration-1"),
      createProductFromExtraction(sampleExtractions.hydration, demoProfile, "hydration-2"),
      createProductFromExtraction(sampleExtractions.hydration, demoProfile, "hydration-3")
    ];
    const score = calculateVanityScore(products, demoProfile);
    expect(score.duplicates.length).toBeGreaterThan(0);
    expect(score.sections.find((section) => section.label === "중복 관리")?.score).toBeLessThan(15);
  });

  test("subtracts for retinoid and exfoliant combination reference", () => {
    const products = [
      createProductFromExtraction(sampleExtractions.retinol, demoProfile, "retinol"),
      createProductFromExtraction(sampleExtractions.lactic, demoProfile, "lactic")
    ];
    const score = calculateVanityScore(products, demoProfile);
    expect(score.combinationNotes.join(" ")).toContain("번갈아 사용 참고");
    expect(score.sections.find((section) => section.label === "조합 관리")?.score).toBeLessThan(15);
  });
});

describe("routine generation", () => {
  test("orders AM routine and puts sunscreen last", () => {
    const products = [
      createProductFromExtraction(sampleExtractions.sunscreen, demoProfile, "sunscreen"),
      createProductFromExtraction(sampleExtractions.cleanser, demoProfile, "cleanser"),
      createProductFromExtraction(sampleExtractions.hydration, demoProfile, "hydration")
    ];
    const routine = generateRoutine(products, demoProfile);
    expect(routine.am[0]?.product.category).toBe("cleanser");
    expect(routine.am[routine.am.length - 1]?.product.category).toBe("sunscreen");
  });

  test("places retinol in PM only", () => {
    const products = [createProductFromExtraction(sampleExtractions.retinol, demoProfile, "retinol")];
    const routine = generateRoutine(products, demoProfile);
    expect(routine.am.some((item) => item.product.name.includes("레티놀"))).toBe(false);
    expect(routine.pm.some((item) => item.product.name.includes("레티놀"))).toBe(true);
  });

  test("does not select retinoid and exfoliant in the same PM routine", () => {
    const products = [
      createProductFromExtraction(sampleExtractions.retinol, demoProfile, "retinol"),
      createProductFromExtraction(sampleExtractions.lactic, demoProfile, "lactic")
    ];
    const routine = generateRoutine(products, demoProfile);
    const hasRetinol = routine.pm.some((item) => item.product.id === "retinol");
    const hasLactic = routine.pm.some((item) => item.product.id === "lactic");
    expect(hasRetinol && hasLactic).toBe(false);
    expect(routine.notes.join(" ")).toContain("동시에 넣지 않았어요");
  });
});

describe("creator personalization", () => {
  test("classifies creator products against my profile and vanity", () => {
    const personalized = personalizeCreatorProducts(creators[0].products, [], demoProfile);
    expect(personalized.length).toBeGreaterThan(0);
    expect(personalized.some((item) => item.label === "내 화장대의 빈 역할을 채움" || item.label === "내 고민과 잘 맞음")).toBe(true);
  });

  test("calculates bounded profile match score", () => {
    expect(calculateProfileMatchScore({ concernMatch: true, fillsMissing: true, needsCheck: false, similar: false })).toBe(95);
    expect(calculateProfileMatchScore({ concernMatch: false, fillsMissing: false, needsCheck: true, similar: true })).toBe(15);
  });
});
