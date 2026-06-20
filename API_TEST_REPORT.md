# API Test Report

Date: 2026-06-20

## Baseline Before Changes

- Git state: clean `main` branch before implementation.
- App typecheck: passed with local `tsc --noEmit`.
- App lint: passed with local `eslint . --max-warnings=0`.
- App tests: 4 suites, 19 tests passed.

## Implemented Validation

App:

- `tsc --noEmit`: passed.
- `eslint . --max-warnings=0`: passed.
- `jest --runInBand --ci`: passed, 6 suites and 33 tests.

Proxy:

- `tsc -p proxy/tsconfig.json --noEmit`: passed.
- Proxy lint through repository ESLint binary: passed.
- Compiled Node test suite: passed, 5 suites and 44 tests.
- Secret-pattern scan for Gemini/API-token assignments: passed, no key-shaped values found.

## Proxy Coverage

The automated proxy tests cover:

- health route success
- health route does not call Gemini
- unsupported health method
- valid token accepted
- missing token rejected
- invalid token rejected
- non-multipart rejected
- no image rejected
- too many images rejected
- oversized image rejected
- combined-size limit enforced
- unsupported MIME rejected
- overly long hints rejected
- front-only request accepted
- ingredient-only request accepted
- two-image request accepted
- successful Gemini result validated
- invalid category rejected
- confidence outside range rejected
- malformed JSON handled
- extra unexpected fields handled
- Gemini authentication error mapped
- Gemini 429 mapped
- Gemini timeout mapped
- Gemini unavailable mapped
- no readable text mapped
- raw upstream error not exposed
- logs do not contain test keys or ingredient contents
- request ID returned
- no-store response headers

## Local Vercel Runtime

Not verified. `vercel` was not installed locally and this runtime does not expose `npm` or `pnpm`, so proxy dependency installation and `vercel dev` could not be rerun. Route handlers were validated directly with Web `Request`/`Response` tests.

## Expo Doctor and Android Build

- Expo Doctor: not verified because `expo-doctor` is not installed locally and this runtime does not expose the selected package manager.
- Android Gradle build: verified with `GRADLE_USER_HOME=../.gradle-home`, `ANDROID_HOME=$HOME/Library/Android/sdk`, Android Studio JBR, `EXPO_PUBLIC_ANALYZER_MODE=remote`, and `EXPO_PUBLIC_ANALYSIS_API_URL=https://changbal-hackathon.vercel.app`.
- Android Gradle result: `:app:assembleDebug` passed. APK produced at `android/app/build/outputs/apk/debug/app-debug.apk`.
- Android emulator launch and runtime flows after this change: not verified. `Pixel_10_Pro` failed to start because the Android emulator reported insufficient host disk space for the AVD.

## Deployment

Production URL supplied for this continuation: `https://changbal-hackathon.vercel.app`.

Vercel Git project settings:

- Root Directory: `proxy`
- Framework Preset: Other
- Production branch: `main`
- Git pushes trigger deployments after one-time Vercel import

Current deployed health validation:

- `GET https://changbal-hackathon.vercel.app/api/health`: HTTP 200.
- JSON schema: valid.
- `ok`: true.
- `service`: `vanitylens-gemini-proxy`.
- `model`: `gemini-3.5-flash`.
- `geminiConfigured`: false.
- `Cache-Control`: `no-store`.
- No secret values were present in the response.

Because `geminiConfigured` is false, this deployment is not yet connected to Gemini. Add `GEMINI_API_KEY` in Vercel Preview and Production and redeploy before claiming real Gemini connectivity.

Deployed negative-request validation that does not require the real client token:

- `POST /api/analyze-product` with no client token: HTTP 401, `UNAUTHORIZED_CLIENT`.
- `POST /api/analyze-product` with an incorrect client token: HTTP 401, `UNAUTHORIZED_CLIENT`.
- `GET /api/analyze-product`: HTTP 405, `METHOD_NOT_ALLOWED`, `Allow: POST`.

Token-dependent negative-request validation not completed:

- incorrect content type with a valid token
- multipart request without images with a valid token

Blocker: no `EXPO_PUBLIC_ANALYZER_CLIENT_TOKEN` or `ANALYZER_CLIENT_TOKEN` was available in ignored local configuration or the process environment. Do not invent or print this value.

Remaining required before claiming fully connected remote production use:

1. Set `GEMINI_API_KEY`, `GEMINI_MODEL`, and `ANALYZER_CLIENT_TOKEN` in Vercel Preview and Production as authorized.
2. Redeploy after changing Vercel environment variables.
3. Verify `GET /api/health` reports `geminiConfigured: true`.
4. Verify token-dependent rejection paths with the real client token available locally.
5. Run one real image smoke test only with an explicit non-personal test image and configured Gemini key.

## Real Gemini Image Test

Not run. Blockers: deployed health reports `geminiConfigured: false`, no valid client token was available locally, and no explicit non-personal test image path was supplied.
