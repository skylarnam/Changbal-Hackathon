import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Image, Platform, StyleSheet } from "react-native";
import { Button, Card, InlineError, Notice, OptionButton, OptionRow, Screen, SectionTitle, TextField } from "../../src/components/ui";
import { categoryLabels, productCategories } from "../../src/copy/ko";
import { sampleExtractions } from "../../src/data/sampleProducts";
import type { AnalyzerExtraction, ProductCategory } from "../../src/domain/types";
import { getConfiguredAnalyzer } from "../../src/services/analyzer/ProductAnalyzer";
import { useAppState } from "../../src/state/AppContext";

export default function ScanScreen() {
  const { setDraftExtraction } = useAppState();
  const analyzer = useMemo(() => getConfiguredAnalyzer(), []);
  const [brand, setBrand] = useState("");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState<ProductCategory>("serum");
  const [rawIngredients, setRawIngredients] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [frontOnlyMessage, setFrontOnlyMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    ImagePicker.getPendingResultAsync()
      .then((pending) => {
        if (!pending || "code" in pending || pending.canceled || pending.assets.length === 0) {
          return;
        }
        setImageUri(pending.assets[0]?.uri ?? null);
      })
      .catch(() => {
        setError("Android Activity 재생성 후 이미지 결과를 복구하지 못했어요. 다시 선택해 주세요.");
      });
  }, []);

  const canManualAnalyze = productName.trim().length > 0 && rawIngredients.trim().length > 0 && !busy;

  function selectSample(key: keyof typeof sampleExtractions) {
    setDraftExtraction(sampleExtractions[key]);
    router.push("/scan/review");
  }

  async function pickImage(source: "camera" | "gallery", hint: "front" | "ingredients") {
    if (busy) {
      return;
    }
    setBusy(true);
    setError(null);
    setFrontOnlyMessage(null);
    try {
      const result = source === "camera" ? await launchCamera() : await launchGallery();
      if (!result) {
        return;
      }
      setImageUri(result);
      if (hint === "front") {
        setFrontOnlyMessage("정확한 분석을 위해 전성분표 사진이나 직접 입력이 필요해요.");
        setDraftExtraction({
          brand: "이미지 초안",
          productName: "제품명 초안",
          category: null,
          rawIngredients: "",
          ingredients: [],
          extractionConfidence: 0.4,
          unreadableSections: ["제품 앞면만 있어 전성분을 분석하지 않았어요."],
          source: "demo",
          imageUri: result
        });
        return;
      }
      const extraction = await analyzer.extractFromImage({ imageUri: result, hint });
      setDraftExtraction(extraction);
      router.push("/scan/review");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "이미지 처리 중 오류가 발생했어요.";
      setError(`${message} 직접 입력 또는 샘플 제품으로 계속 진행할 수 있어요.`);
    } finally {
      setBusy(false);
    }
  }

  function submitManual() {
    if (!canManualAnalyze) {
      setError("제품명과 전성분을 입력해야 분석할 수 있어요.");
      return;
    }
    const extraction: AnalyzerExtraction = {
      brand: brand.trim() || null,
      productName: productName.trim(),
      category,
      rawIngredients,
      ingredients: rawIngredients
        .split(/[,;\n\r]+/g)
        .map((item) => item.trim())
        .filter(Boolean),
      extractionConfidence: 1,
      unreadableSections: [],
      source: "manual",
      imageUri: imageUri ?? undefined
    };
    setDraftExtraction(extraction);
    router.push("/scan/review");
  }

  return (
    <Screen title="스캔" subtitle="전성분표 사진, 샘플 제품, 직접 입력 중 하나로 무료 성분 분석을 시작해요.">
      <Notice>사진이 없어도 직접 입력은 항상 작동해요. API가 없으면 데모 분석 결과로 표시됩니다.</Notice>
      <Card>
        <SectionTitle>이미지 경로</SectionTitle>
        <Button
          title="카메라로 제품 앞면 촬영"
          testID="scan-camera-front"
          variant="secondary"
          loading={busy}
          onPress={() => pickImage("camera", "front")}
        />
        <Button
          title="카메라로 전성분표 촬영"
          testID="scan-camera-ingredients"
          variant="secondary"
          loading={busy}
          onPress={() => pickImage("camera", "ingredients")}
        />
        <Button
          title="갤러리에서 제품 앞면 선택"
          testID="scan-gallery-front"
          variant="secondary"
          loading={busy}
          onPress={() => pickImage("gallery", "front")}
        />
        <Button
          title="갤러리에서 전성분표 선택"
          testID="scan-gallery-ingredients"
          variant="secondary"
          loading={busy}
          onPress={() => pickImage("gallery", "ingredients")}
        />
        {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" /> : null}
        {frontOnlyMessage ? <Notice tone="warning">{frontOnlyMessage}</Notice> : null}
      </Card>
      <Card>
        <SectionTitle>샘플 제품 빠른 테스트</SectionTitle>
        <Button title="수분·진정 세럼" testID="scan-demo-hydration" onPress={() => selectSample("hydration")} />
        <Button title="장벽 크림" testID="scan-demo-barrier" variant="secondary" onPress={() => selectSample("barrier")} />
        <Button title="레티놀 세럼" testID="scan-demo-retinol" variant="secondary" onPress={() => selectSample("retinol")} />
        <Button title="각질 관리 샘플" variant="secondary" onPress={() => selectSample("lactic")} />
      </Card>
      <Card>
        <SectionTitle>직접 입력</SectionTitle>
        <TextField label="브랜드" value={brand} onChangeText={setBrand} placeholder="선택 입력" testID="scan-manual-brand" />
        <TextField label="제품명" value={productName} onChangeText={setProductName} placeholder="예: 수분 진정 세럼" testID="scan-manual-entry" />
        <OptionRow>
          {productCategories.map((item) => (
            <OptionButton key={item} title={categoryLabels[item]} selected={category === item} onPress={() => setCategory(item)} />
          ))}
        </OptionRow>
        <TextField
          label="전성분"
          value={rawIngredients}
          onChangeText={setRawIngredients}
          placeholder="쉼표, 세미콜론, 줄바꿈으로 구분해 입력"
          multiline
          testID="scan-manual-ingredients"
        />
        <Button title="분석 검토로 이동" testID="scan-analyze" disabled={!canManualAnalyze} loading={busy} onPress={submitManual} />
      </Card>
      <InlineError message={error} />
    </Screen>
  );
}

async function launchCamera(): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    if (!permission.canAskAgain) {
      throw new Error(`${Platform.OS === "ios" ? "iOS" : "Android"} 카메라 권한을 다시 요청할 수 없어요. 설정에서 권한을 허용하거나 직접 입력을 사용해 주세요.`);
    }
    throw new Error("카메라 권한이 거부됐어요.");
  }
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: false,
    quality: 0.7,
    mediaTypes: ImagePicker.MediaTypeOptions.Images
  });
  if (result.canceled) {
    throw new Error("카메라 촬영이 취소됐어요.");
  }
  return result.assets[0]?.uri ?? null;
}

async function launchGallery(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    if (!permission.canAskAgain) {
      throw new Error(`${Platform.OS === "ios" ? "iOS" : "Android"} 갤러리 권한을 다시 요청할 수 없어요. 설정에서 권한을 허용하거나 직접 입력을 사용해 주세요.`);
    }
    throw new Error("갤러리 권한이 거부됐어요.");
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: false,
    quality: 0.7,
    mediaTypes: ImagePicker.MediaTypeOptions.Images
  });
  if (result.canceled) {
    throw new Error("갤러리 선택이 취소됐어요.");
  }
  return result.assets[0]?.uri ?? null;
}

const styles = StyleSheet.create({
  preview: {
    width: "100%",
    height: 180,
    borderRadius: 8
  }
});
