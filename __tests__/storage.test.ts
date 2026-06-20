import { defaultAppState, validatePersistedState } from "../src/services/storage/appStorage";
import { demoProfile } from "../src/state/appReducer";

describe("storage schema", () => {
  test("accepts valid persisted state", () => {
    const state = validatePersistedState({
      ...defaultAppState,
      onboardingComplete: true,
      profile: demoProfile
    });
    expect(state.onboardingComplete).toBe(true);
    expect(state.profile?.skinType).toBe("combination");
  });

  test("recovers corrupted values to default state", () => {
    expect(validatePersistedState({ schemaVersion: 999 })).toEqual(defaultAppState);
    expect(validatePersistedState("not-json")).toEqual(defaultAppState);
  });

  test("migrates legacy 14-19 age range to 18-19 and adds remote consent state", () => {
    const legacy = {
      ...defaultAppState,
      schemaVersion: 1,
      remoteAnalysisConsent: undefined,
      profile: {
        ageRange: "14-19",
        skinType: "dry",
        concerns: ["dryness"],
        sensitivity: "normal",
        avoidedIngredients: []
      }
    };
    const migrated = validatePersistedState(legacy);
    expect(migrated.profile?.ageRange).toBe("18-19");
    expect(migrated.remoteAnalysisConsent.geminiImageTransferAccepted).toBe(false);
  });
});
