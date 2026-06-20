import { router } from "expo-router";
import { Alert, View } from "react-native";
import { BodyText, Button, Card, Notice, Screen, SectionTitle, Tag } from "../../src/components/ui";
import { ProductSummary } from "../../src/components/ProductSummary";
import { benefitLabels, VANITY_SCORE_NOTICE } from "../../src/copy/ko";
import { createDemoProduct } from "../../src/data/sampleProducts";
import { generateRoutine } from "../../src/domain/routineGenerator";
import { calculateVanityScore } from "../../src/domain/vanityScore";
import { useAppState } from "../../src/state/AppContext";

export default function VanityScreen() {
  const { state, dispatch, resetState, storageError } = useAppState();
  const activeProducts = state.products.filter((product) => product.status === "active");
  const score = calculateVanityScore(state.products, state.profile);
  const routine = generateRoutine(state.products, state.profile);

  function loadDemoProducts() {
    dispatch({
      type: "loadDemoProducts",
      products: [createDemoProduct("cleanser"), createDemoProduct("hydration"), createDemoProduct("barrier"), createDemoProduct("retinol"), createDemoProduct("lactic")]
    });
  }

  function confirmReset() {
    Alert.alert("앱 초기화", "프로필, 화장대, 팔로우, Pro 데모 상태를 모두 지울까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "초기화",
        style: "destructive",
        onPress: () => {
          resetState().catch(() => undefined);
          router.replace("/onboarding");
        }
      }
    ]);
  }

  return (
    <Screen title="내 화장대" subtitle="현재 사용 중인 제품을 기준으로 구성 점수와 기본 루틴을 계산해요.">
      {storageError ? <Notice tone="warning">{storageError}</Notice> : null}
      {state.isProPreview ? <Tag tone="success">Pro 데모</Tag> : null}
      <Notice>{VANITY_SCORE_NOTICE}</Notice>
      <Card>
        <SectionTitle>화장대 구성 점수</SectionTitle>
        <BodyText>{score.total}점 / 100점</BodyText>
        <BodyText muted>{score.nextAction}</BodyText>
        <Button title="정밀 분석 보기" testID="vanity-analysis-open" onPress={() => router.push("/vanity/analysis")} />
      </Card>
      <Card>
        <SectionTitle>기본 AM 루틴</SectionTitle>
        <View testID="routine-am">
          {routine.am.length > 0 ? (
            routine.am.map((item, index) => <BodyText key={item.product.id}>{index + 1}. {item.product.name} - {item.reason}</BodyText>)
          ) : (
            <BodyText muted>현재 가능한 AM 루틴이 없어요.</BodyText>
          )}
        </View>
        <SectionTitle>기본 PM 루틴</SectionTitle>
        <View testID="routine-pm">
          {routine.pm.length > 0 ? (
            routine.pm.map((item, index) => <BodyText key={item.product.id}>{index + 1}. {item.product.name} - {item.reason}</BodyText>)
          ) : (
            <BodyText muted>현재 가능한 PM 루틴이 없어요.</BodyText>
          )}
        </View>
        {routine.notes.map((note) => (
          <Notice key={note} tone="warning">{note}</Notice>
        ))}
      </Card>
      <Card>
        <SectionTitle>현재 사용 중인 제품</SectionTitle>
        {activeProducts.length === 0 ? (
          <>
            <BodyText muted>아직 화장대에 제품이 없어요.</BodyText>
            <View testID="vanity-empty" />
            <Button title="스캔에서 제품 추가" onPress={() => router.push("/(tabs)/scan")} />
          </>
        ) : (
          activeProducts.map((product) => (
            <ProductSummary key={product.id} product={product} onPress={() => router.push({ pathname: "/product/[id]", params: { id: product.id } })} />
          ))
        )}
      </Card>
      {state.products.some((product) => product.status === "finished") ? (
        <Card>
          <SectionTitle>사용 완료 제품</SectionTitle>
          {state.products
            .filter((product) => product.status === "finished")
            .map((product) => (
              <ProductSummary key={product.id} product={product} onPress={() => router.push({ pathname: "/product/[id]", params: { id: product.id } })} />
            ))}
        </Card>
      ) : null}
      <Card>
        <SectionTitle>관리</SectionTitle>
        <BodyText muted>부족한 기능: {score.missingBenefits.map((benefit) => benefitLabels[benefit]).join(", ") || "없음"}</BodyText>
        <Button title="제품 추가" onPress={() => router.push("/(tabs)/scan")} />
        <Button title="프로필 수정" variant="secondary" onPress={() => router.push("/profile")} />
        <Button title="Pro 안내" variant="secondary" onPress={() => router.push("/pro")} />
        <Button title="데모 제품 불러오기" variant="secondary" onPress={loadDemoProducts} />
        <Button title="앱 초기화" testID="reset-demo-data" variant="danger" onPress={confirmReset} />
      </Card>
    </Screen>
  );
}
