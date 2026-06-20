export interface ProxyLogEvent {
  requestId: string;
  route: string;
  status: number;
  durationMs: number;
  model?: string | undefined;
  hasFrontImage?: boolean | undefined;
  hasIngredientsImage?: boolean | undefined;
  imageByteSizes?: number[] | undefined;
  errorCode?: string | undefined;
  usage?: unknown | undefined;
}

export function logEvent(event: ProxyLogEvent): void {
  console.log(JSON.stringify({ service: "vanitylens-gemini-proxy", ...event }));
}
