export interface ProxyConfig {
  geminiApiKey: string | null;
  geminiModel: string;
  analyzerClientToken: string | null;
}

export const DEFAULT_MODEL = "gemini-3.5-flash";

export function getConfig(env: NodeJS.ProcessEnv = process.env): ProxyConfig {
  return {
    geminiApiKey: clean(env.GEMINI_API_KEY),
    geminiModel: clean(env.GEMINI_MODEL) ?? DEFAULT_MODEL,
    analyzerClientToken: clean(env.ANALYZER_CLIENT_TOKEN)
  };
}

function clean(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
