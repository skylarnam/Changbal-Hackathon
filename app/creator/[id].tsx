import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { BodyText, Button, Card, Notice, OptionButton, OptionRow, Screen, SectionTitle, Tag } from "../../src/components/ui";
import { ProductSummary } from "../../src/components/ProductSummary";
import { PERSONALIZED_SCORE_NOTICE } from "../../src/copy/ko";
import { creators } from "../../src/data/creators";
import { personalizeCreatorProducts } from "../../src/domain/creatorPersonalization";
import { generateRoutine } from "../../src/domain/routineGenerator";
import { useAppState } from "../../src/state/AppContext";

export default function CreatorScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { state } = useAppState();
  const [mode, setMode] = useState<"original" | "personalized">("original");
  const creator = creators.find((item) => item.id === params.id);
  const routine = useMemo(() => (creator ? generateRoutine(creator.products, null) : null), [creator]);
  const personalized = useMemo(() => {
    if (!creator || !state.profile) {
      return [];
    }
    return personalizeCreatorProducts(creator.products, state.products, state.profile);
  }, [creator, state.products, state.profile]);

  if (!creator || !routine) {
    return (
      <Screen title="공개 화장대">
        <Notice tone="warning">찾을 수 없는 공개 화장대예요.</Notice>
        <Button title="발견으로 이동" onPress={() => router.replace("/(tabs)/discover")} />
      </Screen>
    );
  }

  return (
    <Screen title={creator.displayName} subtitle={creator.bio}>
      <Notice>{PERSONALIZED_SCORE_NOTICE}</Notice>
      <OptionRow>
        <OptionButton title="원래 화장대" selected={mode === "original"} onPress={() => setMode("original")} />
        <OptionButton title="내 기준으로 보기" selected={mode === "personalized"} testID="creator-personalize" onPress={() => setMode("personalized")} />
      </OptionRow>
      {mode === "original" ? (
        <>
          <Card>
            <SectionTitle>보유 제품</SectionTitle>
            {creator.products.map((product) => (
              <ProductSummary key={product.id} product={product} />
            ))}
          </Card>
          <Card>
            <SectionTitle>기본 AM 루틴</SectionTitle>
            {routine.am.map((item, index) => (
              <BodyText key={item.product.id}>{index + 1}. {item.product.name}</BodyText>
            ))}
            <SectionTitle>기본 PM 루틴</SectionTitle>
            {routine.pm.map((item, index) => (
              <BodyText key={item.product.id}>{index + 1}. {item.product.name}</BodyText>
            ))}
          </Card>
        </>
      ) : (
        <View>
          {personalized.map((item) => (
            <Card key={item.product.id}>
              <SectionTitle>{item.product.name}</SectionTitle>
              <Tag tone={item.label === "내 설정상 확인 필요" ? "warning" : item.purchasePriority === "high" ? "success" : "default"}>{item.label}</Tag>
              <BodyText>프로필 매칭 참고 점수: {item.score}점</BodyText>
              {item.reasons.map((reason) => (
                <BodyText key={reason}>· {reason}</BodyText>
              ))}
              {item.purchasePriority === "avoidCta" ? (
                <Notice tone="warning">내 설정상 확인 필요 제품은 구매 CTA를 강조하지 않아요.</Notice>
              ) : (
                <Button title="구매처 보기" testID="purchase-open" onPress={() => router.push({ pathname: "/purchase/[productId]", params: { productId: item.product.id } })} />
              )}
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
