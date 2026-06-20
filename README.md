# 화장대 렌즈 (VanityLens)

Expo React Native 기반의 해커톤 MVP입니다. UI 언어는 한국어이고, Android application ID는 `com.vanitylens.app`입니다.

## 실행

```sh
pnpm install
pnpm start
pnpm android
```

현재 Codex 런타임처럼 기본 PATH에 Node가 없는 환경에서는 번들 Node를 PATH에 추가해야 합니다.

```sh
PATH="/Users/whiteskar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/whiteskar/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH" pnpm start
```

## 검증

```sh
pnpm typecheck
pnpm lint
pnpm test:ci
pnpm doctor
```

이 저장소에서는 핵심 도메인 규칙과 폼 흐름을 Jest로 검증합니다.

## Android

Android 에뮬레이터가 있으면 Expo Go 기준으로 실행합니다.

```sh
pnpm android
```

검증 대상 흐름:

- 온보딩 데모 프로필 저장 및 재실행 복원
- 샘플 제품 분석, 수정, 내 화장대 추가
- 화장대 구성 점수, 부족한 선스크린 표시, AM/PM 루틴
- 레티놀과 각질 관리 제품의 PM 동시 배치 방지
- 공개 화장대 진입, 내 기준 재분석, 모의 구매와 제휴 고지
- Pro 데모 잠금 해제 및 재실행 복원
- 이미지 취소, 권한 거부, remote 프록시 실패 후 직접 입력 복구

## iPhone Expo Go

iOS 빌드는 필수 완료 조건이 아니지만 Expo Go 실행을 막는 Android 전용 API는 사용하지 않았습니다. 실제 iPhone에서 remote analyzer를 테스트하려면 `10.0.2.2` 대신 개발자 컴퓨터의 LAN IP 또는 tunnel/ngrok URL을 사용하세요.

예:

```sh
EXPO_PUBLIC_ANALYZER_MODE=remote
EXPO_PUBLIC_ANALYSIS_API_URL=http://192.168.x.x:8787
```

## 분석 모드

기본값은 mock입니다. Gemini API 키 없이 전체 앱 데모가 동작합니다.

```sh
EXPO_PUBLIC_ANALYZER_MODE=mock
```

선택적 remote 분석 프록시:

```sh
cp .env.example .env
pnpm analyzer
```

`.env`에는 서버 전용 `GEMINI_API_KEY`를 넣을 수 있습니다. 이 키는 앱 코드, `EXPO_PUBLIC_*`, Git에 넣으면 안 됩니다.

## 안전 문구

앱의 분석 결과는 전성분과 입력한 피부 프로필을 바탕으로 제공되는 참고 정보입니다. 피부 질환 진단, 치료 권유, 안전 보장, 유해도 판단을 하지 않습니다.
