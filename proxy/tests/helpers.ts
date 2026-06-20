import type { GeminiClient } from "../src/gemini-client.js";

export const TEST_TOKEN = "test-token";

export function jpegFile(size = 128, name = "image.jpg"): File {
  const bytes = new Uint8Array(size);
  bytes[0] = 0xff;
  bytes[1] = 0xd8;
  bytes[2] = 0xff;
  bytes.fill(1, 3);
  return new File([bytes], name, { type: "image/jpeg" });
}

export function pngFile(size = 128, name = "image.png"): File {
  const bytes = new Uint8Array(size);
  bytes[0] = 0x89;
  bytes[1] = 0x50;
  bytes[2] = 0x4e;
  bytes[3] = 0x47;
  bytes[4] = 0x0d;
  bytes[5] = 0x0a;
  bytes[6] = 0x1a;
  bytes[7] = 0x0a;
  bytes.fill(1, 8);
  return new File([bytes], name, { type: "image/png" });
}

export function webpFile(size = 128, name = "image.webp"): File {
  const bytes = new Uint8Array(size);
  bytes[0] = 0x52;
  bytes[1] = 0x49;
  bytes[2] = 0x46;
  bytes[3] = 0x46;
  bytes[8] = 0x57;
  bytes[9] = 0x45;
  bytes[10] = 0x42;
  bytes[11] = 0x50;
  bytes.fill(1, 12);
  return new File([bytes], name, { type: "image/webp" });
}

export function badSignatureFile(): File {
  return new File([new Uint8Array([1, 2, 3, 4])], "bad.jpg", { type: "image/jpeg" });
}

export function analyzeRequest(form: FormData, token: string | null = TEST_TOKEN): Request {
  const headers: Record<string, string> = {};
  if (token !== null) {
    headers["x-vanity-client-token"] = token;
  }
  return new Request("https://proxy.test/api/analyze-product", {
    method: "POST",
    headers,
    body: form
  });
}

export function formWithIngredients(file: File = jpegFile()): FormData {
  const form = new FormData();
  form.append("ingredientsImage", file);
  return form;
}

export const validExtraction = {
  brand: "Demo",
  productName: "Hydration Serum",
  category: "serum",
  rawIngredients: "Water, Glycerin, Panthenol",
  ingredients: ["Water", "Glycerin", "Panthenol"],
  extractionConfidence: 0.87,
  unreadableSections: [],
  detectedLanguages: ["en"],
  imageQualityIssues: [],
  requiresUserReview: true,
  source: "ai"
} as const;

export function fakeClient(text = JSON.stringify(validExtraction)): GeminiClient {
  return {
    async generateExtraction() {
      return {
        text,
        usage: {
          promptTokens: 10,
          outputTokens: 20,
          totalTokens: 30
        }
      };
    }
  };
}

export function failingClient(error: unknown): GeminiClient {
  return {
    async generateExtraction() {
      throw error;
    }
  };
}

export async function readJson(response: Response): Promise<unknown> {
  return response.json() as Promise<unknown>;
}
