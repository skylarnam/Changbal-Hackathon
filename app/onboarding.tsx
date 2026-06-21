import { router } from "expo-router";
import { ProfileForm } from "../src/components/ProfileForm";
import { Screen } from "../src/components/ui";
import { useAppState } from "../src/state/AppContext";
import { demoProfile } from "../src/state/appReducer";
import type { SkinProfile } from "../src/domain/types";

export default function OnboardingScreen() {
  const { dispatch } = useAppState();

  function submit(profile: SkinProfile) {
    dispatch({ type: "saveProfile", profile });
    router.replace("/(tabs)/discover");
  }

  return (
    <Screen eyebrow="Cozy skin ritual" title="화장대 렌즈" subtitle="내 피부 기준으로 공개 화장대, 성분표, 루틴을 차분하게 다시 정리해요.">
      <ProfileForm
        initialProfile={null}
        submitLabel="프로필 저장"
        onSubmit={submit}
        onDemoProfile={() => {
          dispatch({ type: "loadDemoProfile", profile: demoProfile });
          router.replace("/(tabs)/discover");
        }}
      />
    </Screen>
  );
}
