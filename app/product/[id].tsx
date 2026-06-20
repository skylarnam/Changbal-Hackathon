import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert } from "react-native";
import { BodyText, Button, Card, Notice, OptionButton, OptionRow, Screen, SectionTitle, TextField } from "../../src/components/ui";
import { benefitLabels, categoryLabels, MEDICAL_REFERENCE_NOTICE, productCategories } from "../../src/copy/ko";
import type { ProductCategory } from "../../src/domain/types";
import { useAppState } from "../../src/state/AppContext";

export default function ProductDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useAppState();
  const product = state.products.find((item) => item.id === params.id);
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState<ProductCategory>(product?.category ?? "serum");
  const [rawIngredients, setRawIngredients] = useState(product?.rawIngredients ?? "");

  const updatedProduct = useMemo(() => {
    if (!product) {
      return null;
    }
    return {
      ...product,
      brand,
      name,
      category,
      rawIngredients,
      ingredients: rawIngredients
        .split(/[,;\n\r]+/g)
        .map((item) => item.trim())
        .filter(Boolean)
    };
  }, [brand, category, name, product, rawIngredients]);

  if (!product || !updatedProduct) {
    return (
      <Screen title="제품 상세">
        <Notice tone="warning">삭제되었거나 찾을 수 없는 제품이에요.</Notice>
        <Button title="내 화장대로 이동" onPress={() => router.replace("/(tabs)/vanity")} />
      </Screen>
    );
  }

  const currentProduct = product;
  const currentUpdatedProduct = updatedProduct;

  function save() {
    if (!currentUpdatedProduct) {
      return;
    }
    dispatch({ type: "updateProduct", product: currentUpdatedProduct });
    router.back();
  }

  function confirmDelete() {
    Alert.alert("제품 삭제", `${currentProduct.name}을 내 화장대에서 삭제할까요?`, [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          dispatch({ type: "deleteProduct", productId: currentProduct.id });
          router.replace("/(tabs)/vanity");
        }
      }
    ]);
  }

  return (
    <Screen title="제품 상세" subtitle="제품 수정·삭제·사용 완료 처리는 저장 후 즉시 분석에 반영돼요.">
      <Notice>{MEDICAL_REFERENCE_NOTICE}</Notice>
      <Card>
        <TextField label="브랜드" value={brand} onChangeText={setBrand} />
        <TextField label="제품명" value={name} onChangeText={setName} />
        <SectionTitle>카테고리</SectionTitle>
        <OptionRow>
          {productCategories.map((item) => (
            <OptionButton key={item} title={categoryLabels[item]} selected={category === item} onPress={() => setCategory(item)} />
          ))}
        </OptionRow>
        <TextField label="전성분" value={rawIngredients} onChangeText={setRawIngredients} multiline />
        <Button title="수정 저장" disabled={!name.trim() || !rawIngredients.trim()} onPress={save} />
      </Card>
      <Card>
        <SectionTitle>현재 분석</SectionTitle>
        <BodyText>주요 기능: {currentProduct.benefits.map((benefit) => benefitLabels[benefit]).join(", ") || "매칭 없음"}</BodyText>
        <BodyText>상태: {currentProduct.status === "active" ? "사용 중" : "사용 완료"}</BodyText>
        <BodyText>사용자 회피 성분 일치: {currentProduct.analysis.avoidedMatches.join(", ") || "없음"}</BodyText>
        <Button title={currentProduct.status === "active" ? "사용 완료 처리" : "사용 완료 취소"} variant="secondary" onPress={() => dispatch({ type: "toggleFinished", productId: currentProduct.id })} />
        <Button title="제품 삭제" variant="danger" onPress={confirmDelete} />
      </Card>
    </Screen>
  );
}
