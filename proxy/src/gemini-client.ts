import { Buffer } from "node:buffer";
import { GoogleGenAI } from "@google/genai";
import { getGeminiResponseJsonSchema } from "./extraction-schema.js";
import type { ValidatedAnalyzeRequest } from "./request-validation.js";

export interface GeminiUsage {
  promptTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}

export interface GeminiExtractionRawResponse {
  text: string;
  usage: GeminiUsage | null;
}

export interface GeminiClient {
  generateExtraction(input: { request: ValidatedAnalyzeRequest; apiKey: string; model: string }): Promise<GeminiExtractionRawResponse>;
}

export class GoogleGeminiClient implements GeminiClient {
  async generateExtraction({ request, apiKey, model }: { request: ValidatedAnalyzeRequest; apiKey: string; model: string }): Promise<GeminiExtractionRawResponse> {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: buildParts(request)
        }
      ],
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseJsonSchema: getGeminiResponseJsonSchema()
      }
    });
    return {
      text: response.text ?? "",
      usage: normalizeUsage((response as { usageMetadata?: unknown }).usageMetadata)
    };
  }
}

const extractionInstruction = `You are extracting structured text from cosmetic product images.

Use only information visibly present in the provided images.

The image identified as the front image may contain the brand, product name, and product category.

The image identified as the ingredients image may contain the complete ingredient label.

Do not use prior knowledge about the product.
Do not browse or search the internet.
Do not retrieve a known formula from memory.
Do not infer ingredients that are not readable.
Do not substitute the formula of a similarly named product.
Do not correct a formula using outside knowledge.
Do not decide whether the product is safe, harmful, effective, suitable, or medically appropriate.
Do not recommend how to use it.
Do not generate a vanity score or skincare routine.

Preserve the visible ingredient order.
If part of the label cannot be read, record that in unreadableSections.
If a field is uncertain, use null, an empty string, or an empty array as appropriate.
Return only data matching the supplied schema.`;

type GeminiPart = { text: string } | { inlineData: { data: string; mimeType: string } };

function buildParts(request: ValidatedAnalyzeRequest): GeminiPart[] {
  const parts: GeminiPart[] = [];
  const frontImage = request.images.find((image) => image.field === "frontImage");
  const ingredientsImage = request.images.find((image) => image.field === "ingredientsImage");
  if (frontImage) {
    parts.push({ text: "Front product image:" }, toInlinePart(frontImage.bytes, frontImage.mimeType));
  }
  if (ingredientsImage) {
    parts.push({ text: "Ingredients label image:" }, toInlinePart(ingredientsImage.bytes, ingredientsImage.mimeType));
  }
  parts.push({
    text: `${extractionInstruction}\n\nOptional non-authoritative hints:\n${JSON.stringify(request.hints)}`
  });
  return parts;
}

function toInlinePart(bytes: Uint8Array, mimeType: string): { inlineData: { data: string; mimeType: string } } {
  return {
    inlineData: {
      data: Buffer.from(bytes).toString("base64"),
      mimeType
    }
  };
}

function normalizeUsage(value: unknown): GeminiUsage | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const record = value as Record<string, unknown>;
  const usage: GeminiUsage = {};
  if (typeof record.promptTokenCount === "number") {
    usage.promptTokens = record.promptTokenCount;
  }
  if (typeof record.candidatesTokenCount === "number") {
    usage.outputTokens = record.candidatesTokenCount;
  }
  if (typeof record.totalTokenCount === "number") {
    usage.totalTokens = record.totalTokenCount;
  }
  return Object.keys(usage).length > 0 ? usage : null;
}
