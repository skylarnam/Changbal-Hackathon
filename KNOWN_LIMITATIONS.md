# Known Limitations

- The production proxy URL is reachable at `https://changbal-hackathon.vercel.app`, but deployed health currently reports `geminiConfigured: false`; the Vercel `GEMINI_API_KEY` is absent from this deployment or the deployment predates the variable change.
- No real Gemini image extraction was run because deployed health reports `geminiConfigured: false`, no valid local client token was available, and no explicit non-personal test image was supplied.
- Token-dependent deployed negative tests were not completed because no real client token was available in ignored local configuration or the process environment.
- Android debug APK build passes, but emulator runtime validation is blocked until enough host disk space is available for the `Pixel_10_Pro` AVD.
- `ANALYZER_CLIENT_TOKEN` is only a hackathon abuse deterrent. It is bundled in the Expo app and must not be treated as production security.
- Gemini free-tier availability, quota, and data-processing behavior vary by Google project and account settings.
- No paid Google Cloud or Vercel billing was enabled automatically by this repository work.
- The proxy extracts visible product information only. It does not analyze vanity, recommend skincare, search the internet, scrape EWG, or perform medical/skin-image analysis.
- Remote extraction confidence is an OCR/extraction heuristic, not a scientifically calibrated probability.
- The app still requires user review before saving extracted product data.
- Changed Vercel environment variables require redeployment.
- Demo shutdown procedure: set `EXPO_PUBLIC_ANALYZER_MODE=mock` in the app build, remove/rotate `ANALYZER_CLIENT_TOKEN`, and remove or disable `GEMINI_API_KEY` in Vercel.
