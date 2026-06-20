import { z } from "zod";
import { productCategories } from "./schemas.js";

type JsonSchema = Record<string, unknown>;

export function getGeminiResponseJsonSchema(): JsonSchema {
  const schema = z.toJSONSchema(geminiExtractionSchema, { target: "draft-7" }) as JsonSchema;
  return stripUnsupportedJsonSchema(schema) as JsonSchema;
}

const geminiExtractionSchema = z
  .object({
    brand: z.string().max(120).nullable(),
    productName: z.string().max(200).nullable(),
    category: z.enum(productCategories).nullable(),
    rawIngredients: z.string().max(12000),
    ingredients: z.array(z.string().max(180)).max(220),
    extractionConfidence: z.number().min(0).max(1),
    unreadableSections: z.array(z.string().max(240)).max(20),
    detectedLanguages: z.array(z.string().max(12)).max(12),
    imageQualityIssues: z.array(z.string().max(240)).max(20),
    requiresUserReview: z.literal(true),
    source: z.literal("ai")
  })
  .strict();

function stripUnsupportedJsonSchema(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripUnsupportedJsonSchema);
  }
  if (!value || typeof value !== "object") {
    return value;
  }
  const source = value as Record<string, unknown>;
  const target: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(source)) {
    if (["$schema", "$id", "default", "examples"].includes(key)) {
      continue;
    }
    target[key] = stripUnsupportedJsonSchema(nested);
  }
  return target;
}
