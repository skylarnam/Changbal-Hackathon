# VanityLens Gemini Proxy

This Vercel subproject is the only place where `GEMINI_API_KEY` is used. Set the Vercel Root Directory to `proxy/`.

## Responsibility Boundary

The proxy extracts visible product information from product-front and ingredient-label images. It does not analyze vanity, score ingredients, recommend skincare, search the internet, store users, or use skin/face photos. All interpretation remains deterministic Expo app logic.

## Local Setup

```sh
cd proxy
npm install
cp .env.example .env.local
npm run dev
```

Required server variables:

```sh
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash
ANALYZER_CLIENT_TOKEN=
```

`ANALYZER_CLIENT_TOKEN` is bundled in the Expo app as a temporary hackathon abuse deterrent. It is not real authentication and must be rotated after the hackathon.

## Routes

- `GET /api/health`
- `POST /api/analyze-product`

Uploads must use `multipart/form-data`, with at most two images: `frontImage` and `ingredientsImage`. Each image must be `image/jpeg`, `image/png`, or `image/webp`, max 1.5 MB, and combined image bytes max 3.2 MB.

## Validation

```sh
npm run typecheck
npm run lint
npm run test:ci
npm run verify
```

Automated tests mock Gemini and never consume quota.

## Smoke Test

Only run with an explicit image and a configured key/token:

```sh
npm run smoke -- --url http://localhost:3000 --ingredients /absolute/path/to/label.jpg
```

The smoke command never prints keys. Do not commit smoke images.

## Vercel Deployment

1. Create/link a Vercel project with Root Directory `proxy`.
2. Add Preview and Production environment variables: `GEMINI_API_KEY`, `GEMINI_MODEL`, `ANALYZER_CLIENT_TOKEN`.
3. Deploy Preview.
4. Verify `/api/health` and invalid-token rejection.
5. Deploy Production only when authorized.

Changed environment variables require redeployment. Do not enable paid billing automatically.
