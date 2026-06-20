# Build Context for AI Sessions

This file is intentionally placed at the repository root so future AI/code-agent sessions can find the verified build and install workflow quickly.

## Project Snapshot

- App: `화장대 렌즈`
- Expo app slug: `vanitylens`
- Android package: `com.vanitylens.app`
- Package manager: `pnpm@11.5.3`
- Runtime stack: Expo SDK 56, React Native 0.85, Expo Router
- Native Android project exists under `android/` and was generated with Expo prebuild.
- Release bundling requires `babel-preset-expo` as a top-level dev dependency because pnpm strict resolution does not expose it implicitly.

## Verified Environment

- macOS host with Android Studio installed.
- Android SDK path used successfully:

```bash
$HOME/Library/Android/sdk
```

- Java used successfully:

```bash
/Applications/Android Studio.app/Contents/jbr/Contents/Home
```

- Physical Android device verified:

```bash
serial: 6f1ea751
model: CPH2583
abi: arm64-v8a
```

- React Native/Expo native build required these SDK components:
  - NDK `27.1.12297006`
  - CMake `3.22.1`
  - Android SDK Platform `android-36`

If Gradle finds a partial SDK component, remove only the incomplete component directory and rebuild. The previously observed bad state was:

```bash
$HOME/Library/Android/sdk/ndk/27.1.12297006
```

It existed but was incomplete and lacked `source.properties`.

## Verified Emulator Workflow

This workflow was verified with Expo Go on the Android emulator. It is fast because it does not produce a standalone APK and does not run the full native release packaging path.

1. Start the emulator. Verified AVD name:

```bash
"$HOME/Library/Android/sdk/emulator/emulator" -avd Pixel_10_Pro -no-snapshot-save
```

2. Confirm boot:

```bash
"$HOME/Library/Android/sdk/platform-tools/adb" -s emulator-5554 wait-for-device shell getprop sys.boot_completed
```

3. Start and open the app in Expo Go:

```bash
PATH="/Users/whiteskar/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:/Users/whiteskar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" \
pnpm start -- --android --localhost --clear
```

4. Verified emulator flows:
   - onboarding/profile creation
   - product scan/manual review path
   - vanity score and routine display
   - routine conflict messaging
   - creator personalization and purchase mock
   - Pro demo unlock
   - app relaunch state restore

5. Verified screenshot examples were written locally under:

```bash
artifacts/android/
```

Screenshots are intentionally ignored by git.

## Verified Initial Android Device Build and Install

Use this when building for a real Android phone from a fresh or near-fresh native state. This produces a standalone release APK with the JS bundle packaged into the app.

1. Install JS dependencies:

```bash
PATH="/Users/whiteskar/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:/Users/whiteskar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" \
pnpm install
```

2. Generate native Android project if `android/` is missing:

```bash
PATH="/Users/whiteskar/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:/Users/whiteskar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" \
pnpm exec expo prebuild --platform android
```

3. Check the phone:

```bash
"$HOME/Library/Android/sdk/platform-tools/adb" devices -l
```

Verified phone output included:

```bash
6f1ea751 device usb:0-1.3 product:CPH2583 model:CPH2583 device:OP595DL1
```

4. Build release APK:

```bash
cd "/Users/whiteskar/Documents/Changbal Hackathon/android"

GRADLE_USER_HOME=.gradle-home \
ANDROID_HOME="$HOME/Library/Android/sdk" \
ANDROID_SDK_ROOT="$HOME/Library/Android/sdk" \
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
PATH="$HOME/Library/Android/sdk/platform-tools:/Users/whiteskar/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:/Users/whiteskar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" \
./gradlew --no-daemon assembleRelease
```

Verified result:

```bash
android/app/build/outputs/apk/release/app-release.apk
```

The verified release APK was about `92 MB`.

5. Install release APK to the real phone:

```bash
"$HOME/Library/Android/sdk/platform-tools/adb" -s 6f1ea751 install -r "/Users/whiteskar/Documents/Changbal Hackathon/android/app/build/outputs/apk/release/app-release.apk"
```

Verified install output:

```bash
Performing Streamed Install
Success
```

6. Launch:

```bash
"$HOME/Library/Android/sdk/platform-tools/adb" -s 6f1ea751 shell monkey -p com.vanitylens.app -c android.intent.category.LAUNCHER 1
```

7. Verify screenshot:

```bash
"$HOME/Library/Android/sdk/platform-tools/adb" -s 6f1ea751 exec-out screencap -p > artifacts/android/phone-release-launch.png
```

Verified rendered screen: Korean profile screen (`피부 프로필`).

## Verified Subsequent Android Device Build and Install

After the first successful build, Gradle/NDK/CMake outputs are cached. Subsequent real-device builds should skip most native compilation unless dependencies or native config changed.

1. Rebuild release APK:

```bash
cd "/Users/whiteskar/Documents/Changbal Hackathon/android"

GRADLE_USER_HOME=.gradle-home \
ANDROID_HOME="$HOME/Library/Android/sdk" \
ANDROID_SDK_ROOT="$HOME/Library/Android/sdk" \
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
PATH="$HOME/Library/Android/sdk/platform-tools:/Users/whiteskar/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:/Users/whiteskar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" \
./gradlew --no-daemon assembleRelease
```

2. Reinstall:

```bash
"$HOME/Library/Android/sdk/platform-tools/adb" -s 6f1ea751 install -r "/Users/whiteskar/Documents/Changbal Hackathon/android/app/build/outputs/apk/release/app-release.apk"
```

3. Launch:

```bash
"$HOME/Library/Android/sdk/platform-tools/adb" -s 6f1ea751 shell monkey -p com.vanitylens.app -c android.intent.category.LAUNCHER 1
```

## Important Android Debug APK Note

`assembleDebug` was verified to produce an APK, but installing that APK alone showed React Native's red screen:

```text
Unable to load script.
```

That debug APK expects Metro or a packaged debug bundle. For a standalone install on a real phone, use `assembleRelease` as documented above.

If deliberately using the debug APK, run Metro and reverse the port first:

```bash
"$HOME/Library/Android/sdk/platform-tools/adb" -s 6f1ea751 reverse tcp:8081 tcp:8081
pnpm start
"$HOME/Library/Android/sdk/platform-tools/adb" -s 6f1ea751 install -r "/Users/whiteskar/Documents/Changbal Hackathon/android/app/build/outputs/apk/debug/app-debug.apk"
```

## Unverified iOS Build Steps for Teammate

These iOS steps are not verified in this session. They are included so another AI session on a teammate's Mac can read this file and attempt the iOS build on her iPhone.

Prerequisites:

- macOS with Xcode installed.
- Apple Developer account/team configured in Xcode.
- iPhone connected and trusted.
- CocoaPods available through Expo tooling or installed locally.
- Same JS dependency install via `pnpm install`.

Suggested first attempt:

```bash
PATH="/Users/whiteskar/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:/Users/whiteskar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" \
pnpm install
```

Generate iOS native project if `ios/` is missing:

```bash
PATH="/Users/whiteskar/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:/Users/whiteskar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" \
pnpm exec expo prebuild --platform ios
```

Install pods:

```bash
cd ios
pod install
```

Open in Xcode:

```bash
open ios/*.xcworkspace
```

In Xcode:

1. Select the app target.
2. Set signing team and bundle identifier if needed.
3. Select the connected iPhone as the run destination.
4. Build and run.

CLI alternative to try:

```bash
PATH="/Users/whiteskar/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:/Users/whiteskar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" \
pnpm exec expo run:ios --device
```

Expected iOS issues for the teammate's AI session to resolve:

- Signing/team selection.
- Bundle identifier conflict.
- CocoaPods/Ruby environment mismatch.
- iOS permissions strings and native config generated by Expo prebuild.

## External API Placeholder

Real Gemini analysis is not required for local demo. Mock mode works without an API key.

To enable real remote analysis through the Vercel proxy:

```bash
cp proxy/.env.example proxy/.env.local
```

Then set:

```bash
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash
ANALYZER_CLIENT_TOKEN=
```

In the Expo app environment set:

```bash
EXPO_PUBLIC_ANALYZER_MODE=remote
EXPO_PUBLIC_ANALYSIS_API_URL=https://<vercel-domain>
EXPO_PUBLIC_ANALYZER_CLIENT_TOKEN=
```

Run the local Vercel proxy if the Vercel CLI is installed:

```bash
cd proxy
npm run dev
```

For a physical phone, use the deployed HTTPS Vercel URL or a tunnel/LAN URL reachable from the phone. Do not put `GEMINI_API_KEY` in Expo public variables.
