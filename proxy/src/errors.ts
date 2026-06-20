export const errorCodes = [
  "METHOD_NOT_ALLOWED",
  "UNAUTHORIZED_CLIENT",
  "INVALID_MULTIPART",
  "IMAGE_REQUIRED",
  "TOO_MANY_IMAGES",
  "IMAGE_TOO_LARGE",
  "PAYLOAD_TOO_LARGE",
  "UNSUPPORTED_IMAGE_TYPE",
  "INVALID_HINT",
  "GEMINI_NOT_CONFIGURED",
  "GEMINI_AUTH_FAILED",
  "GEMINI_RATE_LIMITED",
  "GEMINI_TIMEOUT",
  "GEMINI_UNAVAILABLE",
  "GEMINI_INVALID_RESPONSE",
  "NO_READABLE_TEXT",
  "INTERNAL_ERROR"
] as const;

export type ErrorCode = (typeof errorCodes)[number];

export class ProxyError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly retryable: boolean;
  readonly retryAfterSeconds: number | null;

  constructor(code: ErrorCode, options: { status?: number; retryable?: boolean; retryAfterSeconds?: number | null; message?: string } = {}) {
    super(options.message ?? userMessageForCode(code));
    this.name = "ProxyError";
    this.code = code;
    this.status = options.status ?? statusForCode(code);
    this.retryable = options.retryable ?? retryableForCode(code);
    this.retryAfterSeconds = options.retryAfterSeconds ?? null;
  }
}

export function statusForCode(code: ErrorCode): number {
  switch (code) {
    case "INVALID_MULTIPART":
    case "IMAGE_REQUIRED":
    case "TOO_MANY_IMAGES":
    case "INVALID_HINT":
      return 400;
    case "UNAUTHORIZED_CLIENT":
      return 401;
    case "METHOD_NOT_ALLOWED":
      return 405;
    case "IMAGE_TOO_LARGE":
    case "PAYLOAD_TOO_LARGE":
      return 413;
    case "UNSUPPORTED_IMAGE_TYPE":
      return 415;
    case "NO_READABLE_TEXT":
      return 422;
    case "GEMINI_RATE_LIMITED":
      return 429;
    case "GEMINI_INVALID_RESPONSE":
      return 502;
    case "GEMINI_NOT_CONFIGURED":
    case "GEMINI_UNAVAILABLE":
      return 503;
    case "GEMINI_TIMEOUT":
      return 504;
    case "GEMINI_AUTH_FAILED":
      return 503;
    case "INTERNAL_ERROR":
      return 500;
  }
}

export function retryableForCode(code: ErrorCode): boolean {
  return ["GEMINI_TIMEOUT", "GEMINI_UNAVAILABLE", "GEMINI_RATE_LIMITED", "INTERNAL_ERROR"].includes(code);
}

export function userMessageForCode(code: ErrorCode): string {
  switch (code) {
    case "METHOD_NOT_ALLOWED":
      return "지원하지 않는 요청 방식이에요.";
    case "UNAUTHORIZED_CLIENT":
      return "분석 서버 인증 토큰이 올바르지 않아요.";
    case "INVALID_MULTIPART":
      return "이미지 업로드 요청 형식이 올바르지 않아요.";
    case "IMAGE_REQUIRED":
      return "제품 앞면 또는 전성분표 이미지가 필요해요.";
    case "TOO_MANY_IMAGES":
      return "이미지는 제품 앞면과 전성분표 최대 두 장만 보낼 수 있어요.";
    case "IMAGE_TOO_LARGE":
      return "이미지 용량이 너무 커요. 다시 촬영하거나 더 작은 이미지로 시도해 주세요.";
    case "PAYLOAD_TOO_LARGE":
      return "전체 업로드 용량이 너무 커요. 이미지를 줄여 다시 시도해 주세요.";
    case "UNSUPPORTED_IMAGE_TYPE":
      return "지원하지 않는 이미지 형식이에요. JPG, PNG, WebP만 사용할 수 있어요.";
    case "INVALID_HINT":
      return "제품 힌트 값이 너무 길거나 올바르지 않아요.";
    case "GEMINI_NOT_CONFIGURED":
      return "원격 분석 서버에 Gemini 키가 설정되지 않았어요. 데모 분석이나 직접 입력을 사용해 주세요.";
    case "GEMINI_AUTH_FAILED":
      return "원격 분석 서버의 Gemini 인증에 실패했어요. 관리자 확인이 필요해요.";
    case "GEMINI_RATE_LIMITED":
      return "원격 분석 요청이 잠시 제한됐어요. 잠시 후 다시 시도해 주세요.";
    case "GEMINI_TIMEOUT":
      return "원격 분석 시간이 초과됐어요. 다시 시도하거나 직접 입력을 사용해 주세요.";
    case "GEMINI_UNAVAILABLE":
      return "원격 분석 서버가 일시적으로 응답하지 않아요.";
    case "GEMINI_INVALID_RESPONSE":
      return "원격 분석 결과 형식이 올바르지 않아 사용할 수 없어요.";
    case "NO_READABLE_TEXT":
      return "전성분표에서 읽을 수 있는 텍스트를 찾지 못했어요. 더 밝고 선명하게 다시 촬영해 주세요.";
    case "INTERNAL_ERROR":
      return "분석 서버에서 오류가 발생했어요. 다시 시도해 주세요.";
  }
}

export function normalizeUnknownError(error: unknown): ProxyError {
  if (error instanceof ProxyError) {
    return error;
  }
  return new ProxyError("INTERNAL_ERROR");
}

export function mapGeminiError(error: unknown): ProxyError {
  if (error instanceof ProxyError) {
    return error;
  }
  const status = extractStatus(error);
  const retryAfterSeconds = extractRetryAfter(error);
  if (status === 401 || status === 403) {
    return new ProxyError("GEMINI_AUTH_FAILED");
  }
  if (status === 429) {
    return new ProxyError("GEMINI_RATE_LIMITED", { retryAfterSeconds });
  }
  if (status === 408 || status === 504 || isTimeoutError(error)) {
    return new ProxyError("GEMINI_TIMEOUT");
  }
  if (status && status >= 500) {
    return new ProxyError("GEMINI_UNAVAILABLE");
  }
  return new ProxyError("GEMINI_UNAVAILABLE");
}

function extractStatus(error: unknown): number | null {
  if (!error || typeof error !== "object") {
    return null;
  }
  const record = error as Record<string, unknown>;
  const status = record.status ?? record.statusCode ?? record.code;
  if (typeof status === "number") {
    return status;
  }
  if (typeof status === "string" && /^\d+$/.test(status)) {
    return Number(status);
  }
  return null;
}

function extractRetryAfter(error: unknown): number | null {
  if (!error || typeof error !== "object") {
    return null;
  }
  const headers = (error as Record<string, unknown>).headers;
  if (!headers || typeof headers !== "object") {
    return null;
  }
  const value = typeof (headers as Headers).get === "function" ? (headers as Headers).get("retry-after") : (headers as Record<string, unknown>)["retry-after"];
  if (typeof value !== "string") {
    return null;
  }
  const seconds = Number(value);
  return Number.isFinite(seconds) ? seconds : null;
}

function isTimeoutError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const record = error as Record<string, unknown>;
  return record.name === "AbortError" || record.name === "TimeoutError" || record.message === "GEMINI_TIMEOUT";
}
