import { router, useLocalSearchParams } from "expo-router";
import { Alert } from "react-native";
import { BodyText, Button, Card, Notice, Screen, SectionTitle } from "../../src/components/ui";
import { AFFILIATE_NOTICE, benefitLabels } from "../../src/copy/ko";
import { creators } from "../../src/data/creators";
import { personalizeProduct } from "../../src/domain/creatorPersonalization";
import { getMissingBenefits } from "../../src/domain/vanityScore";
import { useAppState } from "../../src/state/AppContext";

export default function PurchaseScreen() {
  const params = useLocalSearchParams<{ productId: string }>();
  const { state } = useAppState();
  const product = creators.flatMap((creator) => creator.products).find((item) => item.id === params.productId);

  if (!product) {
    return (
      <Screen title="구매처 보기">
        <Notice tone="warning">제품 정보를 찾을 수 없어요.</Notice>
        <Button title="발견으로 이동" onPress={() => router.replace("/(tabs)/discover")} />
      </Screen>
    );
  }

  const missing = state.profile ? getMissingBenefits(state.products.filter((item) => item.status === "active"), state.profile) : [];
  const personalized = state.profile ? personalizeProduct(product, state.products, state.profile, missing) : null;

  return (
    <Screen title="모의 구매" subtitle="실제 결제나 외부 쇼핑몰 이동 없이 제휴 구조만 시연해요.">
      <Card>
        <SectionTitle>{product.brand} · {product.name}</SectionTitle>
        <BodyText>가격 예시: 24,000원</BodyText>
        <BodyText>왜 추천되었는지: {personalized?.reasons.join(" ") ?? "내 프로필을 만들면 추천 근거를 볼 수 있어요."}</BodyText>
        <BodyText>채우는 기능: {product.benefits.map((benefit) => benefitLabels[benefit]).join(", ") || "중립"}</BodyText>
        <BodyText>이미 가진 제품과의 관계: {personalized?.label ?? "프로필 필요"}</BodyText>
        <Notice>{AFFILIATE_NOTICE}</Notice>
        <Button
          title="외부 구매처로 이동 — 데모"
          testID="affiliate-disclosure"
          onPress={() => Alert.alert("데모 완료", "실제 외부 링크를 열지 않았어요.")}
        />
      </Card>
    </Screen>
  );
}
