import assert from "node:assert/strict";
import { describe, test, mock } from "node:test";
import { handleAnalyzeProductRequest } from "../src/extract-product.js";
import { apiErrorResponseSchema, apiSuccessResponseSchema } from "../src/schemas.js";
import { analyzeRequest, failingClient, fakeClient, formWithIngredients, jpegFile, readJson, TEST_TOKEN, validExtraction } from "./helpers.js";

describe("analyze-product route", () => {
  const config = {
    geminiApiKey: "test-key",
    geminiModel: "gemini-3.5-flash",
    analyzerClientToken: TEST_TOKEN
  };
  const requestId = () => "00000000-0000-4000-8000-000000000001";

  test("returns validated extraction result and request ID", async () => {
    const response = await handleAnalyzeProductRequest(analyzeRequest(formWithIngredients()), {
      config,
      client: fakeClient(),
      requestId,
      now: () => 100
    });
    const json = await readJson(response);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.equal(apiSuccessResponseSchema.parse(json).requestId, requestId());
  });

  test("passes image bytes to Gemini client without exposing raw response", async () => {
    const client = {
      generateExtraction: mock.fn(fakeClient().generateExtraction)
    };
    const response = await handleAnalyzeProductRequest(analyzeRequest(formWithIngredients(jpegFile(256))), {
      config,
      client,
      requestId
    });
    const json = apiSuccessResponseSchema.parse(await readJson(response));
    assert.equal(client.generateExtraction.mock.callCount(), 1);
    assert.equal(client.generateExtraction.mock.calls[0]?.arguments[0].model, "gemini-3.5-flash");
    assert.equal(client.generateExtraction.mock.calls[0]?.arguments[0].apiKey, "test-key");
    assert.deepEqual(json.result, validExtraction);
    assert.equal(JSON.stringify(json).includes("candidates"), false);
  });

  test("returns GEMINI_NOT_CONFIGURED when key is missing", async () => {
    const response = await handleAnalyzeProductRequest(analyzeRequest(formWithIngredients()), {
      config: { ...config, geminiApiKey: null },
      client: fakeClient(),
      requestId
    });
    const json = apiErrorResponseSchema.parse(await readJson(response));
    assert.equal(response.status, 503);
    assert.equal(json.error.code, "GEMINI_NOT_CONFIGURED");
  });

  test("maps missing token to 401", async () => {
    const response = await handleAnalyzeProductRequest(analyzeRequest(formWithIngredients(), null), {
      config,
      client: fakeClient(),
      requestId
    });
    const json = apiErrorResponseSchema.parse(await readJson(response));
    assert.equal(response.status, 401);
    assert.equal(json.error.code, "UNAUTHORIZED_CLIENT");
  });

  test("maps oversized image to 413", async () => {
    const response = await handleAnalyzeProductRequest(analyzeRequest(formWithIngredients(jpegFile(1.5 * 1024 * 1024 + 1))), {
      config,
      client: fakeClient(),
      requestId
    });
    const json = apiErrorResponseSchema.parse(await readJson(response));
    assert.equal(response.status, 413);
    assert.equal(json.error.code, "IMAGE_TOO_LARGE");
  });

  test("maps Gemini rate limit and includes Retry-After", async () => {
    const response = await handleAnalyzeProductRequest(analyzeRequest(formWithIngredients()), {
      config,
      client: failingClient({ status: 429, headers: new Headers({ "retry-after": "9" }) }),
      requestId
    });
    const json = apiErrorResponseSchema.parse(await readJson(response));
    assert.equal(response.status, 429);
    assert.equal(response.headers.get("Retry-After"), "9");
    assert.equal(json.error.code, "GEMINI_RATE_LIMITED");
  });

  test("does not expose raw upstream errors", async () => {
    const response = await handleAnalyzeProductRequest(analyzeRequest(formWithIngredients()), {
      config,
      client: failingClient({ status: 500, message: "raw-secret-upstream-stack" }),
      requestId
    });
    const text = await response.text();
    assert.equal(response.status, 503);
    assert.equal(text.includes("raw-secret-upstream-stack"), false);
    assert.equal(text.includes("GEMINI_UNAVAILABLE"), true);
  });

  test("maps no readable text", async () => {
    const response = await handleAnalyzeProductRequest(analyzeRequest(formWithIngredients()), {
      config,
      client: fakeClient(JSON.stringify({ ...validExtraction, rawIngredients: "", ingredients: [] })),
      requestId
    });
    const json = apiErrorResponseSchema.parse(await readJson(response));
    assert.equal(response.status, 422);
    assert.equal(json.error.code, "NO_READABLE_TEXT");
  });

  test("maps timeout without hidden retries", async () => {
    let callCount = 0;
    const response = await handleAnalyzeProductRequest(analyzeRequest(formWithIngredients()), {
      config,
      timeoutMs: 1,
      requestId,
      client: {
        async generateExtraction() {
          callCount += 1;
          await new Promise((resolve) => setTimeout(resolve, 20));
          return { text: JSON.stringify(validExtraction), usage: null };
        }
      }
    });
    const json = apiErrorResponseSchema.parse(await readJson(response));
    assert.equal(json.error.code, "GEMINI_TIMEOUT");
    assert.equal(callCount, 1);
  });

  test("rejects unsupported methods", async () => {
    const response = await handleAnalyzeProductRequest(new Request("https://proxy.test/api/analyze-product", { method: "GET" }), {
      config,
      client: fakeClient(),
      requestId
    });
    assert.equal(response.status, 405);
    assert.equal(response.headers.get("Allow"), "POST");
  });

  test("logs omit keys and ingredient contents", async () => {
    const original = console.log;
    const calls: string[] = [];
    console.log = (...args: unknown[]) => {
      calls.push(args.join(" "));
    };
    await handleAnalyzeProductRequest(analyzeRequest(formWithIngredients()), {
      config,
      client: fakeClient(),
      requestId
    });
    console.log = original;
    const logs = calls.join("\n");
    assert.equal(logs.includes("test-key"), false);
    assert.equal(logs.includes("Water, Glycerin"), false);
    assert.equal(logs.includes(TEST_TOKEN), false);
    assert.equal(logs.includes("/api/analyze-product"), true);
  });
});
