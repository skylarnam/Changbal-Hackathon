import { router } from "expo-router";
import { BodyText, Button, Card, Notice, Screen, SectionTitle, Tag } from "../../src/components/ui";
import { benefitLabels, VANITY_SCORE_NOTICE } from "../../src/copy/ko";
import { generateRoutine } from "../../src/domain/routineGenerator";
import { calculateVanityScore } from "../../src/domain/vanityScore";
import { useAppState } from "../../src/state/AppContext";

export default function VanityAnalysisScreen() {
  const { state } = useAppState();
  const score = calculateVanityScore(state.products, state.profile);
  const routine = generateRoutine(state.products, state.profile);

  return (
    <Screen title="화장대 정밀 분석" subtitle="중복, 부족한 기능, 조합 참고를 결정론적 규칙으로 계산해요.">
      <Notice>{VANITY_SCORE_NOTICE}</Notice>
      {!state.isProPreview ? (
        <Card>
          <Tag tone="warning">Pro 기능</Tag>
          <SectionTitle>정밀 분석 잠금</SectionTitle>
          <BodyText>전체 화장대 정밀 분석, 상세 중복·부족 기능, AM/PM 전체 루틴은 Pro 데모 체험에서 열 수 있어요.</BodyText>
          <Button title="Pro 데모 보기" onPress={() => router.push("/pro")} />
        </Card>
      ) : (
        <Tag tone="success">Pro 데모</Tag>
      )}
      <Card>
        <SectionTitle>총점</SectionTitle>
        <BodyText>{score.total}점 / 100점</BodyText>
        {score.sections.map((section) => (
          <BodyText key={section.label}>
            {section.label}: {section.score}/{section.maxScore}
            {"\n"}
            {section.reasons.map((reason) => (
              `- ${reason}`
            )).join("\n")}
          </BodyText>
        ))}
      </Card>
      <Card>
        <SectionTitle>부족한 기능</SectionTitle>
        <BodyText>{score.missingBenefits.map((benefit) => benefitLabels[benefit]).join(", ") || "현재 기준 부족한 기능 없음"}</BodyText>
        <SectionTitle>가장 중요한 다음 행동</SectionTitle>
        <BodyText>{score.nextAction}</BodyText>
      </Card>
      {state.isProPreview ? (
        <Card>
          <SectionTitle>AM 전체 루틴</SectionTitle>
          {routine.am.map((item, index) => (
            <BodyText key={item.product.id}>{index + 1}. {item.product.name}: {item.reason}</BodyText>
          ))}
          <SectionTitle>PM 전체 루틴</SectionTitle>
          {routine.pm.map((item, index) => (
            <BodyText key={item.product.id}>{index + 1}. {item.product.name}: {item.reason}</BodyText>
          ))}
          <SectionTitle>번갈아 사용 참고</SectionTitle>
          {routine.alternatives.length > 0 ? (
            routine.alternatives.map((item) => <BodyText key={item.product.id}>{item.product.name}: {item.reason}</BodyText>)
          ) : (
            <BodyText muted>분리된 대체 제품이 없어요.</BodyText>
          )}
        </Card>
      ) : null}
    </Screen>
  );
}
