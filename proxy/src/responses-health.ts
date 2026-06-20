import { getConfig, type ProxyConfig } from "./config.js";
import { ProxyError } from "./errors.js";
import { logEvent } from "./logging.js";
import { jsonResponse, methodNotAllowed } from "./responses.js";

export interface HealthDependencies {
  env?: NodeJS.ProcessEnv;
  config?: ProxyConfig;
  now?: () => number;
  requestId?: () => string;
  timestamp?: () => string;
}

export async function handleHealthRequest(request: Request, dependencies: HealthDependencies = {}): Promise<Response> {
  const startedAt = dependencies.now?.() ?? Date.now();
  const requestId = dependencies.requestId?.() ?? crypto.randomUUID();
  const config = dependencies.config ?? getConfig(dependencies.env);
  let status = 200;
  let errorCode: string | undefined;

  try {
    if (request.method !== "GET") {
      throw new ProxyError("METHOD_NOT_ALLOWED");
    }
    return jsonResponse({
      ok: true,
      service: "vanitylens-gemini-proxy",
      version: "1.0.0",
      model: config.geminiModel,
      geminiConfigured: Boolean(config.geminiApiKey),
      timestamp: dependencies.timestamp?.() ?? new Date().toISOString()
    });
  } catch (error) {
    const proxyError = error instanceof ProxyError ? error : new ProxyError("INTERNAL_ERROR");
    status = proxyError.status;
    errorCode = proxyError.code;
    if (proxyError.code === "METHOD_NOT_ALLOWED") {
      return methodNotAllowed("GET", requestId, proxyError);
    }
    throw error;
  } finally {
    logEvent({
      requestId,
      route: "/api/health",
      status,
      durationMs: Math.max(0, (dependencies.now?.() ?? Date.now()) - startedAt),
      model: config.geminiModel,
      errorCode
    });
  }
}
