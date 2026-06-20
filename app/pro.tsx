import { BodyText, Button, Card, Screen, SectionTitle, Tag } from "../src/components/ui";
import { useAppState } from "../src/state/AppContext";

export default function ProScreen() {
  const { state, dispatch } = useAppState();

  return (
    <Screen title="Pro 데모" subtitle="실제 결제 SDK 없이 해커톤 데모 체험으로 유료 기능을 열어요.">
      {state.isProPreview ? <Tag tone="success">Pro 데모 활성화됨</Tag> : <Tag tone="warning">잠김</Tag>}
      <Card>
        <SectionTitle>요금제</SectionTitle>
        <BodyText>1회 화장대 정밀 점검: 4,900원</BodyText>
        <BodyText>Pro 월간: 3,900원</BodyText>
        <BodyText>Pro 연간: 29,000원</BodyText>
      </Card>
      <Card>
        <SectionTitle>무료 기능</SectionTitle>
        <BodyText>피부 프로필, 제품 사진 선택과 직접 입력, 기본 성분 분석, 내 화장대 저장, 공개 화장대 보기, 팔로우, 기본 루틴 미리 보기, 모의 구매 링크</BodyText>
      </Card>
      <Card>
        <SectionTitle>Pro 시연 기능</SectionTitle>
        <BodyText>전체 화장대 정밀 분석, 중복 및 부족한 기능 상세, AM/PM 전체 루틴, 다른 사람의 화장대를 내 기준으로 상세 분석, 구매 전 내 화장대 중복 검증, 향후 주간 화장대 리포트 소개</BodyText>
        <Button
          title={state.isProPreview ? "Pro 데모 해제" : "해커톤 데모로 Pro 체험"}
          testID="pro-demo-unlock"
          onPress={() => dispatch({ type: "setProPreview", value: !state.isProPreview })}
        />
      </Card>
    </Screen>
  );
}
