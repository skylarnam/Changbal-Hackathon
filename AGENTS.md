# VanityLens Engineering Rules

- Build an Expo React Native cross-platform app with Expo Router and strict TypeScript.
- Android emulator verification is required before claiming Android completion; keep iPhone Expo Go compatibility by avoiding Android-only APIs.
- Prefer deterministic local domain logic with unit tests over generated or remote-only behavior.
- Keep API keys out of app code, `EXPO_PUBLIC_*`, source files, and Git. Gemini keys are server-only.
- The app must work fully in mock/demo mode without a Gemini API key.
- Analysis copy is reference information only and must not imply medical diagnosis, treatment, guaranteed safety, toxicity, or skin-health evaluation.
- Functionality, stability, reproducible tests, and Android verification outrank visual polish.
- Do not implement bonus features before P0 flows are verified; record future ideas in `FUTURE_ROADMAP.md`.
- Use React Native base components and StyleSheet; avoid UI libraries, custom fonts, gradients, and complex animation.
- Keep core logic outside screen components under `src/domain`, `src/services`, and `src/state`.
- Add stable `testID` values for all key interactions.
- Implement loading, empty, error, disabled, retry, and success states for core flows.
- After changes, run typecheck, lint, tests, and relevant runtime checks before reporting success.
