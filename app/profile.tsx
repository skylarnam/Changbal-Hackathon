import { router } from "expo-router";
import { ProfileForm } from "../src/components/ProfileForm";
import { Screen } from "../src/components/ui";
import { useAppState } from "../src/state/AppContext";
import type { SkinProfile } from "../src/domain/types";

export default function ProfileScreen() {
  const { state, dispatch } = useAppState();

  function submit(profile: SkinProfile) {
    dispatch({ type: "saveProfile", profile });
    router.back();
  }

  return (
    <Screen title="프로필 수정" subtitle="저장하면 내 화장대 분석과 공개 화장대 재분석 기준이 갱신돼요.">
      <ProfileForm initialProfile={state.profile} submitLabel="수정 저장" onSubmit={submit} />
    </Screen>
  );
}
