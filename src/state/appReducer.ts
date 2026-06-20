import type { AppStateShape, Product, SkinProfile } from "../domain/types";
import { analyzeProduct } from "../domain/productAnalysis";
import { defaultAppState } from "../services/storage/appStorage";

export type AppAction =
  | { type: "hydrate"; state: AppStateShape }
  | { type: "saveProfile"; profile: SkinProfile }
  | { type: "addProduct"; product: Product }
  | { type: "updateProduct"; product: Product }
  | { type: "deleteProduct"; productId: string }
  | { type: "toggleFinished"; productId: string }
  | { type: "toggleFollow"; creatorId: string }
  | { type: "setProPreview"; value: boolean }
  | { type: "setRemoteAnalysisConsent"; value: boolean; updatedAt: string }
  | { type: "resetAll" }
  | { type: "loadDemoProfile"; profile: SkinProfile }
  | { type: "loadDemoProducts"; products: Product[] };

export const demoProfile: SkinProfile = {
  ageRange: "20s",
  skinType: "combination",
  concerns: ["sensitivity", "barrier"],
  sensitivity: "high",
  avoidedIngredients: ["향료"]
};

export function appReducer(state: AppStateShape, action: AppAction): AppStateShape {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "saveProfile":
      return {
        ...state,
        onboardingComplete: true,
        profile: action.profile
      };
    case "loadDemoProfile":
      return {
        ...state,
        onboardingComplete: true,
        profile: action.profile,
        demoSettings: {
          ...state.demoSettings,
          hasLoadedDemoProfile: true
        }
      };
    case "addProduct": {
      const duplicate = state.products.some((product) => normalizeProductName(product) === normalizeProductName(action.product));
      if (duplicate) {
        return state;
      }
      return {
        ...state,
        products: [...state.products, reanalyzeProduct(action.product, state.profile)]
      };
    }
    case "updateProduct":
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.product.id ? reanalyzeProduct({ ...action.product, updatedAt: new Date().toISOString() }, state.profile) : product
        )
      };
    case "deleteProduct":
      return {
        ...state,
        products: state.products.filter((product) => product.id !== action.productId)
      };
    case "toggleFinished":
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.productId
            ? {
                ...product,
                status: product.status === "active" ? "finished" : "active",
                updatedAt: new Date().toISOString()
              }
            : product
        )
      };
    case "toggleFollow":
      return {
        ...state,
        followedCreatorIds: state.followedCreatorIds.includes(action.creatorId)
          ? state.followedCreatorIds.filter((creatorId) => creatorId !== action.creatorId)
          : [...state.followedCreatorIds, action.creatorId]
      };
    case "setProPreview":
      return {
        ...state,
        isProPreview: action.value
      };
    case "setRemoteAnalysisConsent":
      return {
        ...state,
        remoteAnalysisConsent: {
          geminiImageTransferAccepted: action.value,
          updatedAt: action.updatedAt
        }
      };
    case "loadDemoProducts":
      return {
        ...state,
        products: action.products.map((product) => reanalyzeProduct(product, state.profile))
      };
    case "resetAll":
      return defaultAppState;
    default:
      return assertNever(action);
  }
}

function normalizeProductName(product: Product): string {
  return `${product.brand}:${product.name}`.toLowerCase().trim();
}

function reanalyzeProduct(product: Product, profile: SkinProfile | null): Product {
  const analysis = analyzeProduct(
    {
      brand: product.brand,
      productName: product.name,
      category: product.category,
      rawIngredients: product.rawIngredients,
      ingredients: product.ingredients,
      extractionConfidence: product.extractionConfidence,
      unreadableSections: [],
      source: product.source,
      imageUri: product.imageUri
    },
    profile
  );
  return {
    ...product,
    benefits: analysis.benefits,
    concernFlags: analysis.concernFlags,
    analysis
  };
}

function assertNever(value: never): never {
  throw new Error(`Unhandled action: ${JSON.stringify(value)}`);
}
