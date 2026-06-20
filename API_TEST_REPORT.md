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

Not verified. `vercel` was not installed locally and dependency installation was blocked by the environment usage limit. Route handlers were validated directly with Web `Request`/`Response` tests.

## Expo Doctor and Android Build

- Expo Doctor: not verified because `expo-doctor` is not installed locally and package fetching is blocked by the environment usage limit.
- Android Gradle build: attempted with `GRADLE_USER_HOME=.gradle-home JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" ./gradlew :app:assembleDebug`.
- Android Gradle result: sandboxed run failed with `java.net.SocketException: Operation not permitted`; escalated rerun was blocked by the environment usage limit.
- Android emulator launch and runtime flows after this change: not verified because the Android build step could not proceed.

## Deployment

Not deployed. Required before remote production use:

1. Create or link a Vercel project with Root Directory `proxy`.
2. Set `GEMINI_API_KEY`, `GEMINI_MODEL`, and `ANALYZER_CLIENT_TOKEN` in Vercel Preview and Production as authorized.
3. Deploy Preview.
4. Verify `GET /api/health`.
5. Verify invalid-token rejection.
6. Run one real image smoke test only with an explicit image and configured Gemini key.
7. Deploy Production only when authorized.

## Real Gemini Image Test

Not run. Blockers: no deployed URL, no confirmed Gemini key in `proxy/.env.local`, and no explicit test image path supplied.
