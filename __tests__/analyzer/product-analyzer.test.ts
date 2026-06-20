import {
  buildAnalysisFormData,
  checkAnalyzerHealth,
  normalizeAnalysisApiUrl,
  RemoteAnalyzerError,
  RemoteProductAnalyzer,
  type PreparedAnalyzerImage
} from "../../src/services/analyzer/ProductAnalyzer";

const image: PreparedAnalyzerImage = {
  uri: "file:///label.jpg",
  name: "label.jpg",
  type: "image/jpeg",
  sizeBytes: 100,
  blob: new Blob([new Uint8Array([1, 2, 3])], { type: "image/jpeg" })
};

describe("RemoteProductAnalyzer", () => {
  test("normalizes API URLs", () => {
    expect(normalizeAnalysisApiUrl(" https://example.com/// ")).toBe("https://example.com");
  });

  test("builds multipart form data with image fields and hints", () => {
    const form = buildAnalysisFormData({
      frontImage: image,
      ingredientsImage: image,
      brandHint: " Demo ",
      productNameHint: "Serum",
      categoryHint: "serum"
    });
    expect(form.get("frontImage")).toBeTruthy();
    expect(form.get("ingredientsImage")).toBeTruthy();
    expect(form.get("brandHint")).toBe("Demo");
    expect(form.get("productNameHint")).toBe("Serum");
    expect(form.get("categoryHint")).toBe("serum");
    expect(form.get("promptVersion")).toBe("vanitylens-extraction-v1");
  });

  test("sends token header without manual multipart Content-Type", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        requestId: "request-1",
        result: {
          brand: "Demo",
          productName: "Serum",
          category: "serum",
          rawIngredients: "Water, Glycerin",
          ingredients: ["Water", "Glycerin"],
          extractionConfidence: 0.8,
          unreadableSections: [],
          detectedLanguages: ["en"],
          imageQualityIssues: [],
          requiresUserReview: true,
          source: "ai"
        },
        meta: {
          model: "gemini-3.5-flash",
          durationMs: 100
        }
      })
    });
    const analyzer = new RemoteProductAnalyzer("https://example.com/", {
      token: "client-token",
      fetchImpl: fetchMock as unknown as typeof fetch
    });

    await analyzer.extractProductImages({ ingredientsImage: image });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/api/analyze-product",
      expect.objectContaining({
        method: "POST",
        headers: { "x-vanity-client-token": "client-token" }
      })
    );
    expect(fetchMock.mock.calls[0]?.[1]?.headers).not.toHaveProperty("Content-Type");
  });

  test("maps 401 remote errors", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        error: {
          code: "UNAUTHORIZED_CLIENT",
          message: "분석 서버 인증 토큰이 올바르지 않아요.",
          retryable: false,
          requestId: "request-1",
          retryAfterSeconds: null
        }
      })
    });
    const analyzer = new RemoteProductAnalyzer("https://example.com", {
      token: "bad",
      fetchImpl: fetchMock as unknown as typeof fetch
    });
    await expect(analyzer.extractProductImages({ ingredientsImage: image })).rejects.toMatchObject({
      code: "UNAUTHORIZED_CLIENT",
      status: 401
    });
  });

  test("maps 413 remote errors", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 413,
      json: async () => ({
        error: {
          code: "IMAGE_TOO_LARGE",
          message: "이미지 용량이 너무 커요.",
          retryable: false,
          requestId: "request-1",
          retryAfterSeconds: null
        }
      })
    });
    const analyzer = new RemoteProductAnalyzer("https://example.com", {
      token: "token",
      fetchImpl: fetchMock as unknown as typeof fetch
    });
    await expect(analyzer.extractProductImages({ ingredientsImage: image })).rejects.toMatchObject({ code: "IMAGE_TOO_LARGE" });
  });

  test("maps 429 remote errors", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({
        error: {
          code: "GEMINI_RATE_LIMITED",
          message: "원격 분석 요청이 잠시 제한됐어요.",
          retryable: true,
          requestId: "request-1",
          retryAfterSeconds: 10
        }
      })
    });
    const analyzer = new RemoteProductAnalyzer("https://example.com", {
      token: "token",
      fetchImpl: fetchMock as unknown as typeof fetch
    });
    await expect(analyzer.extractProductImages({ ingredientsImage: image })).rejects.toMatchObject({
      code: "GEMINI_RATE_LIMITED",
      retryAfterSeconds: 10
    });
  });

  test("maps malformed success response", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ unexpected: true })
    });
    const analyzer = new RemoteProductAnalyzer("https://example.com", {
      token: "token",
      fetchImpl: fetchMock as unknown as typeof fetch
    });
    await expect(analyzer.extractProductImages({ ingredientsImage: image })).rejects.toBeInstanceOf(RemoteAnalyzerError);
  });

  test("fails clearly when remote mode has no API URL", async () => {
    const analyzer = new RemoteProductAnalyzer("", {
      token: "token",
      fetchImpl: jest.fn() as unknown as typeof fetch
    });
    await expect(analyzer.extractProductImages({ ingredientsImage: image })).rejects.toMatchObject({
      code: "ANALYSIS_API_URL_MISSING"
    });
  });

  test("maps remote timeout", async () => {
    const fetchMock = jest.fn(
      () =>
        new Promise((_resolve, reject) => {
          setTimeout(() => reject(Object.assign(new Error("aborted"), { name: "AbortError" })), 5);
        })
    );
    const analyzer = new RemoteProductAnalyzer("https://example.com", {
      token: "token",
      timeoutMs: 1,
      fetchImpl: fetchMock as unknown as typeof fetch
    });
    await expect(analyzer.extractProductImages({ ingredientsImage: image })).rejects.toMatchObject({ code: "GEMINI_TIMEOUT" });
  });

  test("parses health response", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        service: "vanitylens-gemini-proxy",
        version: "1.0.0",
        model: "gemini-3.5-flash",
        geminiConfigured: false,
        timestamp: "2026-06-20T00:00:00.000Z"
      })
    });
    const health = await checkAnalyzerHealth("https://example.com/", fetchMock as unknown as typeof fetch);
    expect(health.model).toBe("gemini-3.5-flash");
    expect(fetchMock).toHaveBeenCalledWith("https://example.com/api/health", expect.objectContaining({ method: "GET" }));
  });
});
