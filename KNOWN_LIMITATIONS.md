# Known Limitations

- Vercel deployment was not completed in this local session because Vercel CLI/dependency installation was blocked by the environment usage limit.
- No real Gemini image extraction was run because no deployed endpoint, Gemini key, and explicit test image were available.
- `ANALYZER_CLIENT_TOKEN` is only a hackathon abuse deterrent. It is bundled in the Expo app and must not be treated as production security.
- Gemini free-tier availability, quota, and data-processing behavior vary by Google project and account settings.
- The proxy extracts visible product information only. It does not analyze vanity, recommend skincare, search the internet, scrape EWG, or perform medical/skin-image analysis.
- Remote extraction confidence is an OCR/extraction heuristic, not a scientifically calibrated probability.
- The app still requires user review before saving extracted product data.
- Changed Vercel environment variables require redeployment.
- Demo shutdown procedure: set `EXPO_PUBLIC_ANALYZER_MODE=mock` in the app build, remove/rotate `ANALYZER_CLIENT_TOKEN`, and remove or disable `GEMINI_API_KEY` in Vercel.
