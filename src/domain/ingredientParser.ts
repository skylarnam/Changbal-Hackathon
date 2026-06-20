import { ingredientDefinitions } from "../data/ingredients";
import type { IngredientDefinition, IngredientFlag, ParsedIngredient } from "./types";

const aliasIndex = new Map<string, IngredientDefinition>();

for (const definition of ingredientDefinitions) {
  aliasIndex.set(normalizeIngredientName(definition.standardName), definition);
  for (const alias of definition.aliases) {
    aliasIndex.set(normalizeIngredientName(alias), definition);
  }
}

export function normalizeIngredientName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[(){}\[\]※*•·]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitRawIngredients(rawIngredients: string): string[] {
  return rawIngredients
    .split(/[,;\n\r]+/g)
    .map((part) => part.replace(/^[0-9.\-\s]+/g, "").trim())
    .filter(Boolean);
}

export function parseIngredients(rawIngredients: string | string[]): ParsedIngredient[] {
  const source = Array.isArray(rawIngredients) ? rawIngredients : splitRawIngredients(rawIngredients);
  const seenForDisplay = new Set<string>();

  return source
    .map((name) => {
      const normalizedName = normalizeIngredientName(name);
      const definition = aliasIndex.get(normalizedName);
      const parsed: ParsedIngredient = {
        originalName: name.trim(),
        normalizedName,
        standardName: definition?.standardName ?? null,
        benefits: definition?.benefits ?? [],
        flags: definition?.flags ?? [],
        matched: Boolean(definition)
      };
      return parsed;
    })
    .filter((item) => {
      if (!item.normalizedName || seenForDisplay.has(item.normalizedName)) {
        return false;
      }
      seenForDisplay.add(item.normalizedName);
      return true;
    });
}

export function matchIngredientName(value: string): IngredientDefinition | null {
  return aliasIndex.get(normalizeIngredientName(value)) ?? null;
}

export function ingredientHasFlag(ingredient: ParsedIngredient, flag: IngredientFlag): boolean {
  return ingredient.flags.includes(flag);
}

export function collectIngredientFlags(ingredients: ParsedIngredient[]): IngredientFlag[] {
  return uniqueFlatMap(ingredients, (ingredient) => ingredient.flags);
}

export function hasIngredientFlag(ingredients: ParsedIngredient[], flag: IngredientFlag): boolean {
  return ingredients.some((ingredient) => ingredient.flags.includes(flag));
}

export function uniqueFlatMap<T, R>(values: T[], mapper: (value: T) => R[]): R[] {
  return Array.from(new Set(values.flatMap(mapper)));
}
