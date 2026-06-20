import assert from "node:assert/strict";
import { describe, test, mock } from "node:test";
import { handleHealthRequest } from "../src/responses-health.js";
import { healthResponseSchema } from "../src/schemas.js";
import { readJson } from "./helpers.js";

describe("health route", () => {
  test("returns service status without exposing secrets", async () => {
    const response = await handleHealthRequest(new Request("https://proxy.test/api/health"), {
      config: {
        geminiApiKey: "secret-test-key",
        geminiModel: "gemini-3.5-flash",
        analyzerClientToken: "token"
      },
      timestamp: () => "2026-06-20T00:00:00.000Z"
    });
    const json = await readJson(response);

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.deepEqual(healthResponseSchema.parse(json), {
      ok: true,
      service: "vanitylens-gemini-proxy",
      version: "1.0.0",
      model: "gemini-3.5-flash",
      geminiConfigured: true,
      timestamp: "2026-06-20T00:00:00.000Z"
    });
    assert.equal(JSON.stringify(json).includes("secret-test-key"), false);
  });

  test("does not call Gemini", async () => {
    const spy = mock.fn();
    await handleHealthRequest(new Request("https://proxy.test/api/health"), {
      config: {
        geminiApiKey: null,
        geminiModel: "gemini-3.5-flash",
        analyzerClientToken: "token"
      }
    });
    assert.equal(spy.mock.callCount(), 0);
  });

  test("rejects unsupported methods with Allow header", async () => {
    const response = await handleHealthRequest(new Request("https://proxy.test/api/health", { method: "POST" }));
    const json = await readJson(response);
    assert.equal(response.status, 405);
    assert.equal(response.headers.get("Allow"), "GET");
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.equal(JSON.stringify(json).includes("METHOD_NOT_ALLOWED"), true);
  });
});
