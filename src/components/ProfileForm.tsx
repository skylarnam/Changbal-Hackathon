import { useMemo, useState } from "react";
import type { SkinConcern, SkinProfile } from "../domain/types";
import { ageRangeLabels, ageRanges, concernLabels, sensitivityLabels, sensitivityLevels, skinConcerns, skinTypeLabels, skinTypes } from "../copy/ko";
import { BodyText, Button, Card, InlineError, Label, Notice, OptionButton, OptionRow, TextField } from "./ui";
import { demoProfile } from "../state/appReducer";

interface ProfileFormProps {
  initialProfile: SkinProfile | null;
  submitLabel: string;
  onSubmit: (profile: SkinProfile) => void;
  onDemoProfile?: () => void;
}

export function ProfileForm({ initialProfile, submitLabel, onSubmit, onDemoProfile }: ProfileFormProps) {
  const [ageRange, setAgeRange] = useState<SkinProfile["ageRange"] | null>(initialProfile?.ageRange ?? null);
  const [skinType, setSkinType] = useState<SkinProfile["skinType"] | null>(initialProfile?.skinType ?? null);
  const [concerns, setConcerns] = useState<SkinConcern[]>(initialProfile?.concerns ?? []);
  const [sensitivity, setSensitivity] = useState<SkinProfile["sensitivity"] | null>(initialProfile?.sensitivity ?? null);
  const [avoidInput, setAvoidInput] = useState((initialProfile?.avoidedIngredients ?? []).join(", "));
  const [error, setError] = useState<string | null>(null);

  const avoidedIngredients = useMemo(
    () =>
      avoidInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [avoidInput]
  );

  const valid = Boolean(ageRange && skinType && concerns.length > 0 && concerns.length <= 2 && sensitivity);

  function toggleConcern(concern: SkinConcern) {
    setError(null);
    if (concerns.includes(concern)) {
      setConcerns(concerns.filter((item) => item !== concern));
      return;
    }
    if (concerns.length >= 2) {
      setError("피부 고민은 최대 두 개까지 선택할 수 있어요.");
      return;
    }
    setConcerns([...concerns, concern]);
  }

  function submit() {
    if (!ageRange || !skinType || concerns.length === 0 || !sensitivity) {
      setError("필수 항목을 모두 선택해 주세요.");
      return;
    }
    onSubmit({
      ageRange,
      skinType,
      concerns,
      sensitivity,
      avoidedIngredients
    });
  }

  function loadDemoLocally() {
    setAgeRange(demoProfile.ageRange);
    setSkinType(demoProfile.skinType);
    setConcerns(demoProfile.concerns);
    setSensitivity(demoProfile.sensitivity);
    setAvoidInput(demoProfile.avoidedIngredients.join(", "));
    setError(null);
    onDemoProfile?.();
  }

  return (
    <>
      <Notice>만 14세 이상 사용을 전제로 하는 데모 앱이에요. 피부 사진은 받지 않아요.</Notice>
      <Card>
        <Label>연령대</Label>
        <OptionRow>
          {ageRanges.map((item) => (
            <OptionButton key={item} title={ageRangeLabels[item]} selected={ageRange === item} onPress={() => setAgeRange(item)} />
          ))}
        </OptionRow>
      </Card>
      <Card>
        <Label>피부 타입</Label>
        <OptionRow>
          {skinTypes.map((item) => (
            <OptionButton key={item} title={skinTypeLabels[item]} selected={skinType === item} onPress={() => setSkinType(item)} />
          ))}
        </OptionRow>
      </Card>
      <Card>
        <Label>피부 고민 최대 두 개</Label>
        <OptionRow>
          {skinConcerns.map((item) => (
            <OptionButton
              key={item}
              title={concernLabels[item]}
              selected={concerns.includes(item)}
              onPress={() => toggleConcern(item)}
              accessibilityLabel={`피부 고민 ${concernLabels[item]}`}
            />
          ))}
        </OptionRow>
        <BodyText muted>선택됨: {concerns.map((concern) => concernLabels[concern]).join(", ") || "없음"}</BodyText>
      </Card>
      <Card>
        <Label>민감도</Label>
        <OptionRow>
          {sensitivityLevels.map((item) => (
            <OptionButton key={item} title={sensitivityLabels[item]} selected={sensitivity === item} onPress={() => setSensitivity(item)} />
          ))}
        </OptionRow>
      </Card>
      <TextField
        label="피하고 싶은 성분"
        value={avoidInput}
        onChangeText={setAvoidInput}
        placeholder="예: 향료, 에센셜 오일, 변성 알코올"
        testID="profile-avoid-ingredients"
      />
      <InlineError message={error} />
      <Button title="데모 프로필 불러오기" testID="onboarding-demo-profile" variant="secondary" onPress={loadDemoLocally} />
      <Button title={submitLabel} testID="onboarding-submit" disabled={!valid} onPress={submit} />
    </>
  );
}
