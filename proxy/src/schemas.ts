import { z } from "zod";
import { errorCodes } from "./errors.js";

export const productCategories = ["cleanser", "toner", "essence", "serum", "treatment", "moisturizer", "sunscreen", "mask", "oil", "other"] as const;

export const extractionResultSchema = z
  .object({
    brand: z.string().trim().max(120).nullable(),
    productName: z.string().trim().max(200).nullable(),
    category: z.enum(productCategories).nullable(),
    rawIngredients: z.string().max(12000),
    ingredients: z
      .array(z.string().trim().max(180))
      .max(220)
      .transform((items) => items.map((item) => item.trim()).filter(Boolean)),
    extractionConfidence: z.number().min(0).max(1),
    unreadableSections: z.array(z.string().trim().max(240)).max(20).transform((items) => items.filter(Boolean)),
    detectedLanguages: z.array(z.string().trim().min(1).max(12)).max(12).transform((items) => items.filter(Boolean)),
    imageQualityIssues: z.array(z.string().trim().max(240)).max(20).transform((items) => items.filter(Boolean)),
    requiresUserReview: z.literal(true),
    source: z.literal("ai")
  })
  .strict();

export type ExtractionResult = z.infer<typeof extractionResultSchema>;
export type ProductCategory = (typeof productCategories)[number];

export const healthResponseSchema = z
  .object({
    ok: z.literal(true),
    service: z.literal("vanitylens-gemini-proxy"),
    version: z.literal("1.0.0"),
    model: z.string(),
    geminiConfigured: z.boolean(),
    timestamp: z.string()
  })
  .strict();

export const apiSuccessResponseSchema = z
  .object({
    requestId: z.string().uuid(),
    result: extractionResultSchema,
    meta: z.object({
      model: z.string(),
      durationMs: z.number().nonnegative(),
      usage: z
        .object({
          promptTokens: z.number().nonnegative().optional(),
          outputTokens: z.number().nonnegative().optional(),
          totalTokens: z.number().nonnegative().optional()
        })
        .strict()
        .nullable()
        .optional()
    })
  })
  .strict();

export const apiErrorResponseSchema = z
  .object({
    error: z
      .object({
        code: z.enum(errorCodes),
        message: z.string(),
        retryable: z.boolean(),
        requestId: z.string().uuid(),
        retryAfterSeconds: z.number().nonnegative().nullable()
      })
      .strict()
  })
  .strict();

export const hintFieldsSchema = z
  .object({
    brandHint: z.string().trim().max(120).optional(),
    productNameHint: z.string().trim().max(200).optional(),
    categoryHint: z.enum(productCategories).optional(),
    promptVersion: z.string().trim().max(40).optional()
  })
  .strict();

export type HintFields = z.infer<typeof hintFieldsSchema>;
