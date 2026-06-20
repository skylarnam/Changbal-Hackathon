import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { mapGeminiError, ProxyError, retryableForCode, statusForCode, userMessageForCode } from "../src/errors.js";

describe("error mapping", () => {
  test("maps Gemini authentication errors", () => {
    const error = mapGeminiError({ status: 401 });
    assert.equal(error.code, "GEMINI_AUTH_FAILED");
    assert.equal(error.status, 503);
  });

  test("maps Gemini 429 with retry-after", () => {
    const headers = new Headers({ "retry-after": "12" });
    const error = mapGeminiError({ status: 429, headers });
    assert.equal(error.code, "GEMINI_RATE_LIMITED");
    assert.equal(error.status, 429);
    assert.equal(error.retryAfterSeconds, 12);
  });

  test("maps Gemini timeout", () => {
    const error = mapGeminiError(new ProxyError("GEMINI_TIMEOUT"));
    assert.equal(error.code, "GEMINI_TIMEOUT");
    assert.equal(error.status, 504);
  });

  test("maps Gemini unavailable", () => {
    const error = mapGeminiError({ status: 503 });
    assert.equal(error.code, "GEMINI_UNAVAILABLE");
    assert.equal(error.status, 503);
  });

  test("has stable statuses and Korean messages", () => {
    assert.equal(statusForCode("UNAUTHORIZED_CLIENT"), 401);
    assert.equal(retryableForCode("GEMINI_UNAVAILABLE"), true);
    assert.equal(userMessageForCode("IMAGE_REQUIRED").includes("이미지"), true);
  });
});
