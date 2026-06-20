import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { getGeminiResponseJsonSchema } from "../src/extraction-schema.js";
import { parseAndValidateGeminiResult } from "../src/extract-product.js";
import { validExtraction } from "./helpers.js";

describe("Gemini response validation", () => {
  test("validates successful Gemini result", () => {
    const result = parseAndValidateGeminiResult(JSON.stringify(validExtraction), { hasFrontImage: true, hasIngredientsImage: true });
    assert.equal(result.source, "ai");
    assert.equal(result.requiresUserReview, true);
  });

  test("front-only request does not pretend ingredient extraction succeeded", () => {
    const result = parseAndValidateGeminiResult(JSON.stringify(validExtraction), { hasFrontImage: true, hasIngredientsImage: false });
    assert.equal(result.rawIngredients, "");
    assert.deepEqual(result.ingredients, []);
    assert.equal(result.unreadableSections.join(" ").includes("전성분표 이미지"), true);
  });

  test("rejects invalid category", () => {
    assert.throws(() =>
      parseAndValidateGeminiResult(JSON.stringify({ ...validExtraction, category: "medicine" }), { hasFrontImage: true, hasIngredientsImage: true })
    );
  });

  test("rejects confidence outside range", () => {
    assert.throws(() =>
      parseAndValidateGeminiResult(JSON.stringify({ ...validExtraction, extractionConfidence: 1.2 }), { hasFrontImage: true, hasIngredientsImage: true })
    );
  });

  test("handles malformed JSON", () => {
    assert.throws(() => parseAndValidateGeminiResult("{", { hasFrontImage: true, hasIngredientsImage: true }));
  });

  test("rejects extra unexpected fields", () => {
    assert.throws(() =>
      parseAndValidateGeminiResult(JSON.stringify({ ...validExtraction, safetyScore: 90 }), { hasFrontImage: true, hasIngredientsImage: true })
    );
  });

  test("maps ingredient image without readable content to NO_READABLE_TEXT", () => {
    assert.throws(() =>
      parseAndValidateGeminiResult(JSON.stringify({ ...validExtraction, rawIngredients: "", ingredients: [] }), {
        hasFrontImage: false,
        hasIngredientsImage: true
      })
    );
  });

  test("rejects obviously duplicated OCR ingredient lists", () => {
    const ingredients = ["Water", "Glycerin", "Panthenol", "Niacinamide", "Betaine", "Squalane"];
    assert.throws(() =>
      parseAndValidateGeminiResult(JSON.stringify({ ...validExtraction, ingredients: [...ingredients, ...ingredients] }), {
        hasFrontImage: true,
        hasIngredientsImage: true
      })
    );
  });

  test("rejects safety or recommendation language leakage", () => {
    assert.throws(() =>
      parseAndValidateGeminiResult(JSON.stringify({ ...validExtraction, unreadableSections: ["safe and recommended"] }), {
        hasFrontImage: true,
        hasIngredientsImage: true
      })
    );
  });

  test("creates a JSON schema for Gemini structured output", () => {
    const schema = getGeminiResponseJsonSchema();
    assert.equal("type" in schema, true);
    assert.equal(JSON.stringify(schema).includes("$schema"), false);
  });
});
