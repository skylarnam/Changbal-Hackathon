# 화장대 렌즈 (VanityLens)

Expo React Native 기반의 한국어 해커톤 MVP입니다. Android application ID는 `com.vanitylens.app`입니다.

## App Modes

Mock mode is the default and works without Gemini:

```sh
EXPO_PUBLIC_ANALYZER_MODE=mock
EXPO_PUBLIC_ANALYSIS_API_URL=
EXPO_PUBLIC_ANALYZER_CLIENT_TOKEN=
```

Remote mode sends product images to the shared HTTPS proxy:

```sh
EXPO_PUBLIC_ANALYZER_MODE=remote
EXPO_PUBLIC_ANALYSIS_API_URL=https://changbal-hackathon.vercel.app
EXPO_PUBLIC_ANALYZER_CLIENT_TOKEN=
```

Do not include `/api/analyze-product` in `EXPO_PUBLIC_ANALYSIS_API_URL`. A trailing slash is safe; the app normalizes it.

## Gemini Proxy

The production-shaped proxy is a separate Vercel subproject in `proxy/`. Set the Vercel Root Directory to `proxy`.

Architecture:

```text
Expo app -> Vercel HTTPS function -> Gemini API -> Vercel function -> Expo app -> local deterministic skincare logic
```

Boundary:

- The proxy extracts visible product-front and ingredient-label text only.
- The proxy does not analyze vanity, recommend skincare, score ingredients, browse/search, scrape EWG, store users, process payments, or analyze skin/face photos.
- All benefit/concern matching, vanity scoring, AM/PM routines, creator personalization, and purchase prioritization stay in the Expo app.

Production proxy base URL: `https://changbal-hackathon.vercel.app`

Vercel project settings:

- Root Directory: `proxy`
- Framework Preset: Other
- Production branch: `main`
- Git pushes after the one-time Vercel import trigger deployments

See [proxy/README.md](proxy/README.md).

## Setup

```sh
pnpm install
pnpm start
```

If this Codex runtime has Node outside the default PATH:

```sh
PATH="/Users/whiteskar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/whiteskar/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" pnpm start
```

## Validation

App:

```sh
pnpm typecheck
pnpm lint
pnpm test:ci
pnpm doctor
```

Proxy:

```sh
pnpm proxy:install
pnpm proxy:typecheck
pnpm proxy:lint
pnpm proxy:test
```

## Android and iPhone Expo Go

Android emulator and physical Android can use mock mode immediately. Remote mode needs `EXPO_PUBLIC_ANALYSIS_API_URL`. A deployed HTTPS proxy URL is required for physical phones; local `10.0.2.2` only works from Android emulator when explicitly configured.

iPhone Expo Go also works with the same deployed HTTPS proxy URL: `https://changbal-hackathon.vercel.app`. A development tunnel/LAN URL is only needed when testing an undeployed local proxy.

## Image Upload Rules

The app normalizes selected product images to JPEG with `expo-image-manipulator` before remote upload. The proxy enforces:

- maximum two images: `frontImage`, `ingredientsImage`
- per-image max 1.5 MB
- combined image bytes max 3.2 MB
- accepted MIME types: JPEG, PNG, WebP
- multipart/form-data only

Remote image analysis shows this consent before the first upload and persists it locally:

> 제품 및 전성분표 이미지가 분석을 위해 Google Gemini API로 전송될 수 있어요. 얼굴, 피부 사진, 이름, 연락처 등 개인정보가 포함된 이미지는 업로드하지 마세요.

The app does not send age, skin profile, vanity data, names, contact info, skin photos, or face photos to Gemini.

## Environment Variables

Expo public variables:

```sh
EXPO_PUBLIC_ANALYZER_MODE=mock
EXPO_PUBLIC_ANALYSIS_API_URL=
EXPO_PUBLIC_ANALYZER_CLIENT_TOKEN=
```

Proxy server variables:

```sh
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash
ANALYZER_CLIENT_TOKEN=
```

`ANALYZER_CLIENT_TOKEN` is bundled in the Expo app, is not a true secret, is not user authentication, and should be rotated after the hackathon.

Set proxy variables in both Vercel Preview and Production. Changing Vercel environment variables requires a new deployment before `/api/health` reflects the new configuration.

## Safety and Age

The app is limited to users aged 18 or older. Analysis copy is reference information only and does not diagnose, treat, guarantee safety, or judge harmfulness.
