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
});
