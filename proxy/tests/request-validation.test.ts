import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { ProxyError } from "../src/errors.js";
import { MAX_COMBINED_IMAGE_BYTES, MAX_IMAGE_BYTES, validateAnalyzeRequest } from "../src/request-validation.js";
import { analyzeRequest, badSignatureFile, formWithIngredients, jpegFile, pngFile, TEST_TOKEN, webpFile } from "./helpers.js";

describe("request validation", () => {
  test("accepts valid token and ingredient-only JPEG", async () => {
    const result = await validateAnalyzeRequest(analyzeRequest(formWithIngredients()), TEST_TOKEN);
    assert.equal(result.hasIngredientsImage, true);
    assert.equal(result.hasFrontImage, false);
  });

  test("rejects missing token", async () => {
    await assert.rejects(validateAnalyzeRequest(analyzeRequest(formWithIngredients(), null), TEST_TOKEN), { code: "UNAUTHORIZED_CLIENT" });
  });

  test("rejects invalid token", async () => {
    await assert.rejects(validateAnalyzeRequest(analyzeRequest(formWithIngredients(), "wrong"), TEST_TOKEN), { code: "UNAUTHORIZED_CLIENT" });
  });

  test("rejects non-multipart request", async () => {
    const request = new Request("https://proxy.test/api/analyze-product", {
      method: "POST",
      headers: {
        "x-vanity-client-token": TEST_TOKEN,
        "Content-Type": "application/json"
      },
      body: "{}"
    });
    await assert.rejects(validateAnalyzeRequest(request, TEST_TOKEN), { code: "INVALID_MULTIPART" });
  });

  test("rejects no image", async () => {
    await assert.rejects(validateAnalyzeRequest(analyzeRequest(new FormData()), TEST_TOKEN), { code: "IMAGE_REQUIRED" });
  });

  test("rejects duplicate files under one field", async () => {
    const form = new FormData();
    form.append("ingredientsImage", jpegFile());
    form.append("ingredientsImage", jpegFile());
    await assert.rejects(validateAnalyzeRequest(analyzeRequest(form), TEST_TOKEN), { code: "TOO_MANY_IMAGES" });
  });

  test("rejects more than two image files", async () => {
    const form = new FormData();
    form.append("frontImage", jpegFile());
    form.append("ingredientsImage", jpegFile());
    form.append("extraImage", jpegFile());
    await assert.rejects(validateAnalyzeRequest(analyzeRequest(form), TEST_TOKEN), { code: "TOO_MANY_IMAGES" });
  });

  test("rejects oversized image", async () => {
    await assert.rejects(validateAnalyzeRequest(analyzeRequest(formWithIngredients(jpegFile(MAX_IMAGE_BYTES + 1))), TEST_TOKEN), { code: "IMAGE_TOO_LARGE" });
  });

  test("enforces combined-size limit", async () => {
    const size = Math.floor(MAX_COMBINED_IMAGE_BYTES / 2) + 100;
    const form = new FormData();
    form.append("frontImage", jpegFile(size));
    form.append("ingredientsImage", pngFile(size));
    await assert.rejects(validateAnalyzeRequest(analyzeRequest(form), TEST_TOKEN), { code: "PAYLOAD_TOO_LARGE" });
  });

  test("rejects unsupported MIME type", async () => {
    const form = formWithIngredients(new File([new Uint8Array([1, 2, 3])], "label.gif", { type: "image/gif" }));
    await assert.rejects(validateAnalyzeRequest(analyzeRequest(form), TEST_TOKEN), { code: "UNSUPPORTED_IMAGE_TYPE" });
  });

  test("rejects mismatched binary signature", async () => {
    await assert.rejects(validateAnalyzeRequest(analyzeRequest(formWithIngredients(badSignatureFile())), TEST_TOKEN), { code: "UNSUPPORTED_IMAGE_TYPE" });
  });

  test("rejects overly long hints", async () => {
    const form = formWithIngredients();
    form.append("brandHint", "x".repeat(121));
    await assert.rejects(validateAnalyzeRequest(analyzeRequest(form), TEST_TOKEN), { code: "INVALID_HINT" });
  });

  test("accepts front-only request", async () => {
    const form = new FormData();
    form.append("frontImage", webpFile());
    const result = await validateAnalyzeRequest(analyzeRequest(form), TEST_TOKEN);
    assert.equal(result.hasFrontImage, true);
    assert.equal(result.hasIngredientsImage, false);
  });

  test("accepts two-image request with supported hints", async () => {
    const form = new FormData();
    form.append("frontImage", jpegFile());
    form.append("ingredientsImage", pngFile());
    form.append("categoryHint", "serum");
    const result = await validateAnalyzeRequest(analyzeRequest(form), TEST_TOKEN);
    assert.equal(result.images.length, 2);
    assert.equal(result.hints.categoryHint, "serum");
  });

  test("throws ProxyError instances", async () => {
    await assert.rejects(validateAnalyzeRequest(analyzeRequest(new FormData()), TEST_TOKEN), ProxyError);
  });
});
