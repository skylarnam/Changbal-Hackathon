import type { ProxyError } from "./errors.js";

const noStoreHeaders = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8"
};

export function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...noStoreHeaders,
      ...(init.headers ?? {})
    }
  });
}

export function methodNotAllowed(allow: string, requestId: string, error: ProxyError): Response {
  return errorResponse(error, requestId, {
    Allow: allow
  });
}

export function errorResponse(error: ProxyError, requestId: string, extraHeaders: HeadersInit = {}): Response {
  const retryHeaders = error.retryAfterSeconds ? { "Retry-After": String(error.retryAfterSeconds) } : {};
  return jsonResponse(
    {
      error: {
        code: error.code,
        message: error.message,
        retryable: error.retryable,
        requestId,
        retryAfterSeconds: error.retryAfterSeconds
      }
    },
    {
      status: error.status,
      headers: {
        ...retryHeaders,
        ...extraHeaders
      }
    }
  );
}
