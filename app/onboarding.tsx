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
    <Screen title="화장대 렌즈" subtitle="내 화장대를 기준으로 루틴, 중복, 부족한 기능을 정리해요.">
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
