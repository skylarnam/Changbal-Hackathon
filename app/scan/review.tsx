import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Text } from "react-native";
import { BodyText, Button, Card, InlineError, Notice, OptionButton, OptionRow, Screen, SectionTitle, Tag, TextField } from "../../src/components/ui";
import { benefitLabels, categoryLabels, MEDICAL_REFERENCE_NOTICE, productCategories } from "../../src/copy/ko";
import { createProductFromExtraction, analyzeProduct } from "../../src/domain/productAnalysis";
import type { AnalyzerExtraction, ProductAnalysisResult, ProductCategory } from "../../src/domain/types";
import { useAppState } from "../../src/state/AppContext";

export default function ReviewScreen() {
  const { draftExtraction, setDraftExtraction, state, dispatch } = useAppState();
  const [brand, setBrand] = useState(draftExtraction?.brand ?? "");
  const [productName, setProductName] = useState(draftExtraction?.productName ?? "");
  const [category, setCategory] = useState<ProductCategory>(draftExtraction?.category ?? "serum");
  const [rawIngredients, setRawIngredients] = useState(draftExtraction?.rawIngredients ?? "");
  const [ingredientList, setIngredientList] = useState((draftExtraction?.ingredients ?? []).join("\n"));
  const [analysis, setAnalysis] = useState<ProductAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const editedExtraction: AnalyzerExtraction | null = useMemo(() => {
    if (!draftExtraction) {
      return null;
    }
    return {
      ...draftExtraction,
      brand: brand.trim() || null,
      productName: productName.trim() || null,
      category,
      rawIngredients,
      ingredients: ingredientList
        .split(/[,;\n\r]+/g)
        .map((item) => item.trim())
        .filter(Boolean)
    };
  }, [brand, category, draftExtraction, ingredientList, productName, rawIngredients]);

  const canConfirm = Boolean(editedExtraction?.productName && (editedExtraction.rawIngredients.trim() || editedExtraction.ingredients.length > 0));

  function confirmAnalysis() {
    if (!editedExtraction || !canConfirm) {
      setError("정확한 분석을 위해 제품명과 전성분 입력이 필요해요.");
      return;
    }
    setError(null);
    setAnalysis(analyzeProduct(editedExtraction, state.profile));
  }

  function addToVanity() {
    if (!editedExtraction || !analysis || added) {
      return;
    }
    const product = createProductFromExtraction(editedExtraction, state.profile);
    dispatch({ type: "addProduct", product });
    setDraftExtraction(null);
    setAdded(true);
    router.replace("/(tabs)/vanity");
  }

  if (!draftExtraction) {
    return (
      <Screen title="분석 검토">
        <Notice tone="warning">검토할 제품 정보가 없어요. 스캔 화면에서 다시 시작해 주세요.</Notice>
        <Button title="스캔으로 이동" onPress={() => router.replace("/(tabs)/scan")} />
      </Screen>
    );
  }

  return (
    <Screen title="분석 검토" subtitle="AI 또는 데모 추출 결과를 그대로 믿지 말고 수정한 뒤 분석을 확정해요.">
      <Notice>{MEDICAL_REFERENCE_NOTICE}</Notice>
      {draftExtraction.source === "demo" ? <Tag tone="warning">데모 분석 결과</Tag> : null}
      <Card>
        <TextField label="브랜드" value={brand} onChangeText={setBrand} placeholder="브랜드 미상" />
        <TextField label="제품명" value={productName} onChangeText={setProductName} placeholder="제품명" />
        <SectionTitle>제품 카테고리</SectionTitle>
        <OptionRow>
          {productCategories.map((item) => (
            <OptionButton key={item} title={categoryLabels[item]} selected={category === item} onPress={() => setCategory(item)} />
          ))}
        </OptionRow>
        <TextField label="전성분 원문" value={rawIngredients} onChangeText={setRawIngredients} multiline />
        <TextField label="개별 성분 목록" value={ingredientList} onChangeText={setIngredientList} multiline />
        <Button title="분석 확정" testID="scan-analyze" disabled={!canConfirm} onPress={confirmAnalysis} />
      </Card>
      {analysis ? (
        <Card testID="scan-analysis-result">
          <SectionTitle>분석 결과</SectionTitle>
          <BodyText>주요 기능 태그: {analysis.benefits.map((benefit) => benefitLabels[benefit]).join(", ") || "매칭 없음"}</BodyText>
          <BodyText>프로필 적합 참고: {analysis.concernFlags.length}개 고민과 연결</BodyText>
          <BodyText>사용자 회피 성분 일치: {analysis.avoidedMatches.join(", ") || "없음"}</BodyText>
          <BodyText>민감 피부라면 확인: {analysis.sensitiveNotes.join(" ") || "현재 설정 기준 별도 참고 없음"}</BodyText>
          <BodyText>데이터 신뢰도: {Math.round(analysis.extractionConfidence * 100)}%</BodyText>
          <BodyText>매칭되지 않은 성분 수: {analysis.unmatchedCount}</BodyText>
          {analysis.limitations.map((item) => (
            <Text key={item}>- {item}</Text>
          ))}
          <Button title="내 화장대에 추가" testID="scan-confirm-add" onPress={addToVanity} disabled={added} />
        </Card>
      ) : null}
      <InlineError message={error} />
    </Screen>
  );
}
