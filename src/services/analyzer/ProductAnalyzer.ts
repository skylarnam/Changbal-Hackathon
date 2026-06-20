import { z } from "zod";
import type { AnalyzerExtraction, ProductCategory } from "../../domain/types";
import { sampleExtractions } from "../../data/sampleProducts";

export interface AnalyzeImageInput {
  imageUri?: string;
  hint: "front" | "ingredients";
}

export interface PreparedAnalyzerImage {
  uri: string;
  name: string;
  type: "image/jpeg" | "image/png" | "image/webp";
  sizeBytes?: number;
  blob?: Blob;
}

export interface AnalyzeProductImagesInput {
  frontImage?: PreparedAnalyzerImage;
  ingredientsImage?: PreparedAnalyzerImage;
  brandHint?: string;
  productNameHint?: string;
  categoryHint?: ProductCategory;
  signal?: AbortSignal;
}

export interface AnalyzerHealth {
  ok: true;
  service: "vanitylens-gemini-proxy";
  version: "1.0.0";
  model: string;
  geminiConfigured: boolean;
  timestamp: string;
  responseTimeMs: number;
}

export interface ProductAnalyzer {
  extractFromImage(input: AnalyzeImageInput): Promise<AnalyzerExtraction>;
  extractProductImages(input: AnalyzeProductImagesInput): Promise<AnalyzerExtraction>;
}

export class RemoteAnalyzerError extends Error {
  readonly code: string;
  readonly retryable: boolean;
  readonly retryAfterSeconds: number | null;
  readonly status: number | null;

  constructor(message: string, options: { code: string; retryable?: boolean; retryAfterSeconds?: number | null; status?: number | null }) {
    super(message);
    this.name = "RemoteAnalyzerError";
    this.code = options.code;
    this.retryable = options.retryable ?? false;
    this.retryAfterSeconds = options.retryAfterSeconds ?? null;
    this.status = options.status ?? null;
  }
}

const categorySchema = z.enum(["cleanser", "toner", "essence", "serum", "treatment", "moisturizer", "sunscreen", "mask", "oil", "other"]);

const extractionSchema = z
  .object({
    brand: z.string().nullable(),
    productName: z.string().nullable(),
    category: categorySchema.nullable(),
    rawIngredients: z.string(),
    ingredients: z.array(z.string()),
    extractionConfidence: z.number().min(0).max(1),
    unreadableSections: z.array(z.string()),
    detectedLanguages: z.array(z.string()).optional(),
    imageQualityIssues: z.array(z.string()).optional(),
    requiresUserReview: z.literal(true).optional(),
    source: z.literal("ai")
  })
  .strict();

const successSchema = z
  .object({
    requestId: z.string(),
    result: extractionSchema,
    meta: z
      .object({
        model: z.string(),
        durationMs: z.number(),
        usage: z.unknown().optional()
      })
      .optional()
  })
  .strict();

const errorSchema = z
  .object({
    error: z.object({
      code: z.string(),
      message: z.string(),
      retryable: z.boolean(),
      requestId: z.string(),
      retryAfterSeconds: z.number().nullable().optional()
    })
  })
  .strict();

const healthSchema = z
  .object({
    ok: z.literal(true),
    service: z.literal("vanitylens-gemini-proxy"),
    version: z.literal("1.0.0"),
    model: z.string(),
    geminiConfigured: z.boolean(),
    timestamp: z.string()
  })
  .strict();

export class MockProductAnalyzer implements ProductAnalyzer {
  async extractFromImage(input: AnalyzeImageInput): Promise<AnalyzerExtraction> {
    return this.extractProductImages({
      frontImage: input.hint === "front" && input.imageUri ? imageFromUri(input.imageUri, "front") : undefined,
      ingredientsImage: input.hint === "ingredients" && input.imageUri ? imageFromUri(input.imageUri, "ingredients") : undefined
    });
  }

  async extractProductImages(input: AnalyzeProductImagesInput): Promise<AnalyzerExtraction> {
    if (input.frontImage && !input.ingredientsImage) {
      return {
        brand: "이미지 데모",
        productName: "제품명 초안",
        category: null,
        rawIngredients: "",
        ingredients: [],
        extractionConfidence: 0.45,
        unreadableSections: ["전성분표가 없어 성분을 추출하지 않았어요."],
        source: "demo",
        imageUri: input.frontImage.uri
      };
    }
    const uri = input.ingredientsImage?.uri ?? input.frontImage?.uri;
    return {
      ...sampleExtractions.hydration,
      brand: "이미지 데모",
      productName: "전성분표 데모 추출",
      extractionConfidence: 0.72,
      unreadableSections: ["실제 OCR이 아닌 데모 분석 결과예요."],
      source: "demo",
      imageUri: uri
    };
  }
}

export class RemoteProductAnalyzer implements ProductAnalyzer {
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(apiUrl: string, options: { token?: string; timeoutMs?: number; fetchImpl?: typeof fetch } = {}) {
    this.baseUrl = normalizeAnalysisApiUrl(apiUrl);
    this.token = options.token ?? process.env.EXPO_PUBLIC_ANALYZER_CLIENT_TOKEN ?? "";
    this.timeoutMs = options.timeoutMs ?? 48_000;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async extractFromImage(input: AnalyzeImageInput): Promise<AnalyzerExtraction> {
    return this.extractProductImages({
      frontImage: input.hint === "front" && input.imageUri ? imageFromUri(input.imageUri, "front") : undefined,
      ingredientsImage: input.hint === "ingredients" && input.imageUri ? imageFromUri(input.imageUri, "ingredients") : undefined
    });
  }

  async extractProductImages(input: AnalyzeProductImagesInput): Promise<AnalyzerExtraction> {
    if (!this.baseUrl) {
      throw new RemoteAnalyzerError("분석 서버 URL이 설정되지 않았어요. 데모 분석 또는 직접 입력을 사용해 주세요.", {
        code: "ANALYSIS_API_URL_MISSING",
        retryable: false
      });
    }
    const controller = new AbortController();
    const cancelFromCaller = () => controller.abort();
    input.signal?.addEventListener("abort", cancelFromCaller);
    if (input.signal?.aborted) {
      controller.abort();
    }
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchImpl(`${this.baseUrl}/api/analyze-product`, {
        method: "POST",
        headers: {
          "x-vanity-client-token": this.token
        },
        body: buildAnalysisFormData(input),
        signal: controller.signal
      });
      return await parseAnalyzeResponse(response, input.ingredientsImage?.uri ?? input.frontImage?.uri);
    } catch (error) {
      if (error instanceof RemoteAnalyzerError) {
        throw error;
      }
      if (isAbortError(error)) {
        throw new RemoteAnalyzerError("원격 분석 시간이 초과됐어요. 다시 시도하거나 직접 입력을 사용해 주세요.", {
          code: "GEMINI_TIMEOUT",
          retryable: true
        });
      }
      throw new RemoteAnalyzerError("분석 서버에 연결하지 못했어요. 데모 분석 또는 직접 입력을 사용해 주세요.", {
        code: "GEMINI_UNAVAILABLE",
        retryable: true
      });
    } finally {
      clearTimeout(timeout);
      input.signal?.removeEventListener("abort", cancelFromCaller);
    }
  }
}

export function getAnalyzerMode(): "mock" | "remote" {
  return process.env.EXPO_PUBLIC_ANALYZER_MODE === "remote" ? "remote" : "mock";
}

export function getAnalysisApiBaseUrl(): string {
  return normalizeAnalysisApiUrl(process.env.EXPO_PUBLIC_ANALYSIS_API_URL || "");
}

export function getConfiguredAnalyzer(): ProductAnalyzer {
  if (getAnalyzerMode() === "remote") {
    return new RemoteProductAnalyzer(getAnalysisApiBaseUrl());
  }
  return new MockProductAnalyzer();
}

export function normalizeAnalysisApiUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

export function buildAnalysisFormData(input: AnalyzeProductImagesInput): FormData {
  const form = new FormData();
  appendImage(form, "frontImage", input.frontImage);
  appendImage(form, "ingredientsImage", input.ingredientsImage);
  appendText(form, "brandHint", input.brandHint);
  appendText(form, "productNameHint", input.productNameHint);
  appendText(form, "categoryHint", input.categoryHint);
  form.append("promptVersion", "vanitylens-extraction-v1");
  return form;
}

export async function checkAnalyzerHealth(apiUrl = getAnalysisApiBaseUrl(), fetchImpl: typeof fetch = fetch): Promise<AnalyzerHealth> {
  const startedAt = Date.now();
  const response = await fetchImpl(`${normalizeAnalysisApiUrl(apiUrl)}/api/health`, {
    method: "GET",
    headers: {
      Accept: "application/json"
    }
  });
  const json = (await response.json()) as unknown;
  if (!response.ok) {
    throw new RemoteAnalyzerError("분석 서버 상태 확인에 실패했어요.", {
      code: `HTTP_${response.status}`,
      status: response.status,
      retryable: response.status >= 500
    });
  }
  const parsed = healthSchema.safeParse(json);
  if (!parsed.success) {
    throw new RemoteAnalyzerError("분석 서버 상태 응답이 올바르지 않아요.", {
      code: "GEMINI_INVALID_RESPONSE",
      retryable: true
    });
  }
  return {
    ...parsed.data,
    responseTimeMs: Date.now() - startedAt
  };
}

export function remoteAnalyzerErrorMessage(error: unknown): string {
  if (error instanceof RemoteAnalyzerError) {
    return error.message;
  }
  return "원격 분석 중 오류가 발생했어요.";
}

async function parseAnalyzeResponse(response: Response, imageUri?: string): Promise<AnalyzerExtraction> {
  const json = (await safeJson(response)) as unknown;
  if (!response.ok) {
    const parsedError = errorSchema.safeParse(json);
    if (parsedError.success) {
      throw new RemoteAnalyzerError(parsedError.data.error.message, {
        code: parsedError.data.error.code,
        retryable: parsedError.data.error.retryable,
        retryAfterSeconds: parsedError.data.error.retryAfterSeconds ?? null,
        status: response.status
      });
    }
    throw new RemoteAnalyzerError(`분석 프록시 오류 ${response.status}`, {
      code: `HTTP_${response.status}`,
      retryable: response.status >= 500,
      status: response.status
    });
  }
  const parsed = successSchema.safeParse(json);
  if (!parsed.success) {
    throw new RemoteAnalyzerError("분석 프록시 응답 형식이 올바르지 않아요.", {
      code: "GEMINI_INVALID_RESPONSE",
      retryable: true,
      status: response.status
    });
  }
  return {
    ...parsed.data.result,
    source: "ai",
    imageUri
  };
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function appendImage(form: FormData, field: "frontImage" | "ingredientsImage", image: PreparedAnalyzerImage | undefined): void {
  if (!image) {
    return;
  }
  if (image.blob) {
    form.append(field, image.blob, image.name);
    return;
  }
  form.append(field, { uri: image.uri, name: image.name, type: image.type } as unknown as Blob);
}

function appendText(form: FormData, field: string, value: string | undefined): void {
  if (value?.trim()) {
    form.append(field, value.trim());
  }
}

function imageFromUri(uri: string, hint: "front" | "ingredients"): PreparedAnalyzerImage {
  return {
    uri,
    name: `${hint}.jpg`,
    type: "image/jpeg"
  };
}

function isAbortError(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "name" in error && (error as { name?: string }).name === "AbortError");
}
