import AsyncStorage from "@react-native-async-storage/async-storage";
import { z } from "zod";
import type { AppStateShape } from "../../domain/types";

export const STORAGE_KEY = "vanitylens.app-state.v1";
export const SCHEMA_VERSION = 2;

const ageRangeSchema = z.enum(["18-19", "20s", "30s", "40plus"]);
const legacyAgeRangeSchema = z.enum(["14-19", "18-19", "20s", "30s", "40plus"]);
const skinTypeSchema = z.enum(["dry", "oily", "combination", "normal"]);
const concernSchema = z.enum(["dryness", "sensitivity", "acne", "redness", "dullness", "barrier", "antiAging"]);
const sensitivitySchema = z.enum(["low", "normal", "high"]);
const categorySchema = z.enum(["cleanser", "toner", "essence", "serum", "treatment", "moisturizer", "sunscreen", "mask", "oil", "other"]);
const benefitSchema = z.enum([
  "hydration",
  "barrier",
  "soothing",
  "exfoliation",
  "antioxidant",
  "brightening",
  "acneCare",
  "antiAging",
  "sunProtection"
]);
const sourceSchema = z.enum(["ai", "manual", "demo"]);
const statusSchema = z.enum(["active", "finished"]);
const flagSchema = z.enum(["sensitiveReference", "fragrance", "essentialOil", "dryingAlcohol", "retinoid", "exfoliant", "sunscreenFilter"]);

export const skinProfileSchema = z.object({
  ageRange: ageRangeSchema,
  skinType: skinTypeSchema,
  concerns: z.array(concernSchema).max(2),
  sensitivity: sensitivitySchema,
  avoidedIngredients: z.array(z.string())
});

const legacySkinProfileSchema = skinProfileSchema.extend({
  ageRange: legacyAgeRangeSchema
});

const parsedIngredientSchema = z.object({
  originalName: z.string(),
  normalizedName: z.string(),
  standardName: z.string().nullable(),
  benefits: z.array(benefitSchema),
  flags: z.array(flagSchema),
  matched: z.boolean()
});

const productAnalysisSchema = z.object({
  parsedIngredients: z.array(parsedIngredientSchema),
  benefits: z.array(benefitSchema),
  concernFlags: z.array(concernSchema),
  avoidedMatches: z.array(z.string()),
  sensitiveNotes: z.array(z.string()),
  referenceFlags: z.array(flagSchema),
  unmatchedCount: z.number(),
  extractionConfidence: z.number(),
  limitations: z.array(z.string()),
  isDemo: z.boolean()
});

const productSchema = z.object({
  id: z.string(),
  brand: z.string(),
  name: z.string(),
  category: categorySchema,
  rawIngredients: z.string(),
  ingredients: z.array(z.string()),
  benefits: z.array(benefitSchema),
  concernFlags: z.array(concernSchema),
  extractionConfidence: z.number(),
  source: sourceSchema,
  imageUri: z.string().optional(),
  status: statusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  analysis: productAnalysisSchema
});

export const appStateSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  onboardingComplete: z.boolean(),
  profile: skinProfileSchema.nullable(),
  products: z.array(productSchema),
  followedCreatorIds: z.array(z.string()),
  isProPreview: z.boolean(),
  remoteAnalysisConsent: z.object({
    geminiImageTransferAccepted: z.boolean(),
    updatedAt: z.string().nullable()
  }),
  demoSettings: z.object({
    hasLoadedDemoProfile: z.boolean()
  })
});

const legacyAppStateSchema = appStateSchema
  .omit({
    schemaVersion: true,
    profile: true,
    remoteAnalysisConsent: true
  })
  .extend({
    schemaVersion: z.literal(1),
    profile: legacySkinProfileSchema.nullable(),
    remoteAnalysisConsent: z
      .object({
        geminiImageTransferAccepted: z.boolean(),
        updatedAt: z.string().nullable()
      })
      .optional()
  });

export const defaultAppState: AppStateShape = {
  schemaVersion: SCHEMA_VERSION,
  onboardingComplete: false,
  profile: null,
  products: [],
  followedCreatorIds: [],
  isProPreview: false,
  remoteAnalysisConsent: {
    geminiImageTransferAccepted: false,
    updatedAt: null
  },
  demoSettings: {
    hasLoadedDemoProfile: false
  }
};

export function validatePersistedState(value: unknown): AppStateShape {
  const parsed = appStateSchema.safeParse(value);
  if (parsed.success) {
    return parsed.data;
  }
  const legacyParsed = legacyAppStateSchema.safeParse(value);
  if (!legacyParsed.success) {
    return defaultAppState;
  }
  return {
    ...legacyParsed.data,
    schemaVersion: SCHEMA_VERSION,
    profile: legacyParsed.data.profile
      ? {
          ...legacyParsed.data.profile,
          ageRange: legacyParsed.data.profile.ageRange === "14-19" ? "18-19" : legacyParsed.data.profile.ageRange
        }
      : null,
    remoteAnalysisConsent: legacyParsed.data.remoteAnalysisConsent ?? defaultAppState.remoteAnalysisConsent
  };
}

export async function loadPersistedState(): Promise<AppStateShape> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultAppState;
  }
  try {
    return validatePersistedState(JSON.parse(raw));
  } catch {
    return defaultAppState;
  }
}

export async function savePersistedState(state: AppStateShape): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function clearPersistedState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
