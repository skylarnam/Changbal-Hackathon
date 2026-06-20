import { getConfig, type ProxyConfig } from "./config.js";
import { mapGeminiError, ProxyError } from "./errors.js";
import { GoogleGeminiClient, type GeminiClient, type GeminiUsage } from "./gemini-client.js";
import { logEvent } from "./logging.js";
import { type ValidatedAnalyzeRequest, validateAnalyzeRequest } from "./request-validation.js";
import { errorResponse, jsonResponse, methodNotAllowed } from "./responses.js";
import { extractionResultSchema, type ExtractionResult } from "./schemas.js";

export interface AnalyzeDependencies {
  env?: NodeJS.ProcessEnv;
  config?: ProxyConfig;
  client?: GeminiClient;
  now?: () => number;
  requestId?: () => string;
  timeoutMs?: number;
}

export async function handleAnalyzeProductRequest(request: Request, dependencies: AnalyzeDependencies = {}): Promise<Response> {
  const startedAt = dependencies.now?.() ?? Date.now();
  const requestId = dependencies.requestId?.() ?? crypto.randomUUID();
  const config = dependencies.config ?? getConfig(dependencies.env);
  const model = config.geminiModel;
  let status = 200;
  let validated: ValidatedAnalyzeRequest | null = null;
  let usage: GeminiUsage | null | undefined;
  let errorCode: string | undefined;

  try {
    if (request.method !== "POST") {
      throw new ProxyError("METHOD_NOT_ALLOWED");
    }
    validated = await validateAnalyzeRequest(request, config.analyzerClientToken);
    if (!config.geminiApiKey) {
      throw new ProxyError("GEMINI_NOT_CONFIGURED");
    }
    const client = dependencies.client ?? new GoogleGeminiClient();
    const raw = await withTimeout(
      client.generateExtraction({
        request: validated,
        apiKey: config.geminiApiKey,
        model
      }),
      dependencies.timeoutMs ?? 50_000
    ).catch((error: unknown) => {
      throw mapGeminiError(error);
    });
    usage = raw.usage;
    const result = parseAndValidateGeminiResult(raw.text, validated);
    return jsonResponse(
      {
        requestId,
        result,
        meta: {
          model,
          durationMs: Math.max(0, (dependencies.now?.() ?? Date.now()) - startedAt),
          usage: usage ?? undefined
        }
      },
      { status }
    );
  } catch (error) {
    const proxyError = error instanceof ProxyError ? error : new ProxyError("INTERNAL_ERROR");
    status = proxyError.status;
    errorCode = proxyError.code;
    if (proxyError.code === "METHOD_NOT_ALLOWED") {
      return methodNotAllowed("POST", requestId, proxyError);
    }
    return errorResponse(proxyError, requestId);
  } finally {
    logEvent({
      requestId,
      route: "/api/analyze-product",
      status,
      durationMs: Math.max(0, (dependencies.now?.() ?? Date.now()) - startedAt),
      model,
      hasFrontImage: validated?.hasFrontImage ?? false,
      hasIngredientsImage: validated?.hasIngredientsImage ?? false,
      imageByteSizes: validated?.imageByteSizes,
      errorCode,
      usage
    });
  }
}

export function parseAndValidateGeminiResult(text: string, request: Pick<ValidatedAnalyzeRequest, "hasFrontImage" | "hasIngredientsImage">): ExtractionResult {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(text);
  } catch {
    throw new ProxyError("GEMINI_INVALID_RESPONSE");
  }
  const parsed = extractionResultSchema.safeParse(parsedJson);
  if (!parsed.success) {
    throw new ProxyError("GEMINI_INVALID_RESPONSE");
  }
  const result = parsed.data;
  if (!request.hasIngredientsImage) {
    return {
      ...result,
      rawIngredients: "",
      ingredients: [],
      unreadableSections: unique([...result.unreadableSections, "전성분표 이미지가 없어 성분을 추출하지 않았어요."])
    };
  }
  if (request.hasIngredientsImage && result.rawIngredients.trim().length === 0 && result.ingredients.length === 0) {
    throw new ProxyError("NO_READABLE_TEXT");
  }
  if (hasRepeatedIngredientList(result.ingredients) || containsJudgmentLanguage(result)) {
    throw new ProxyError("GEMINI_INVALID_RESPONSE");
  }
  return result;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new ProxyError("GEMINI_TIMEOUT")), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      }
    );
  });
}

function hasRepeatedIngredientList(ingredients: string[]): boolean {
  if (ingredients.length < 12 || ingredients.length % 2 !== 0) {
    return false;
  }
  const midpoint = ingredients.length / 2;
  const first = ingredients.slice(0, midpoint).map(normalize);
  const second = ingredients.slice(midpoint).map(normalize);
  return first.every((ingredient, index) => ingredient === second[index]);
}

function containsJudgmentLanguage(result: ExtractionResult): boolean {
  const joined = [result.rawIngredients, ...result.ingredients, ...result.unreadableSections, ...result.imageQualityIssues].join(" ").toLowerCase();
  return /(safe|unsafe|harmful|effective|recommend|routine|score|안전|유해|추천|루틴|점수|효능을 보장)/i.test(joined);
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items));
}
