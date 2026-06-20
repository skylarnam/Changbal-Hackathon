import { z } from "zod";

export const analyzeProductRequestSchema = z.object({
  imageUri: z.string().optional(),
  hint: z.enum(["front", "ingredients"]).default("ingredients"),
  rawIngredients: z.string().optional()
});

export const analyzerExtractionSchema = z.object({
  brand: z.string().nullable(),
  productName: z.string().nullable(),
  category: z.enum(["cleanser", "toner", "essence", "serum", "treatment", "moisturizer", "sunscreen", "mask", "oil", "other"]).nullable(),
  rawIngredients: z.string(),
  ingredients: z.array(z.string()),
  extractionConfidence: z.number().min(0).max(1),
  unreadableSections: z.array(z.string()),
  source: z.enum(["ai", "manual", "demo"])
});

export type AnalyzeProductRequest = z.infer<typeof analyzeProductRequestSchema>;
export type AnalyzerExtractionResponse = z.infer<typeof analyzerExtractionSchema>;
