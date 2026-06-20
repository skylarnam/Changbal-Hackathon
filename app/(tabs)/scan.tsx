import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Platform, StyleSheet, Text, View } from "react-native";
import { BodyText, Button, Card, InlineError, Notice, OptionButton, OptionRow, Screen, SectionTitle, Tag, TextField } from "../../src/components/ui";
import { categoryLabels, productCategories } from "../../src/copy/ko";
import { sampleExtractions } from "../../src/data/sampleProducts";
import type { AnalyzerExtraction, ProductCategory } from "../../src/domain/types";
import {
  checkAnalyzerHealth,
  getAnalysisApiBaseUrl,
  getAnalyzerMode,
  getConfiguredAnalyzer,
  MockProductAnalyzer,
  remoteAnalyzerErrorMessage,
  type AnalyzerHealth
} from "../../src/services/analyzer/ProductAnalyzer";
import { prepareAnalyzerImage } from "../../src/services/analyzer/imagePreprocessing";
import { useAppState } from "../../src/state/AppContext";

const REMOTE_CONSENT_COPY =
  "제품 및 전성분표 이미지가 분석을 위해 Google Gemini API로 전송될 수 있어요. 얼굴, 피부 사진, 이름, 연락처 등 개인정보가 포함된 이미지는 업로드하지 마세요.";

export default function ScanScreen() {
  const { state, dispatch, setDraftExtraction } = useAppState();
  const analyzer = useMemo(() => getConfiguredAnalyzer(), []);
  const analyzerMode = getAnalyzerMode();
  const apiBaseUrl = getAnalysisApiBaseUrl();
  const [brand, setBrand] = useState("");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState<ProductCategory>("serum");
  const [rawIngredients, setRawIngredients] = useState("");
  const [frontImageUri, setFrontImageUri] = useState<string | null>(null);
  const [ingredientsImageUri, setIngredientsImageUri] = useState<string | null>(null);
  const [frontOnlyMessage, setFrontOnlyMessage] = useState<string | null>(null);
  const [remoteFailure, setRemoteFailure] = useState<string | null>(null);
  const [remoteErrorCode, setRemoteErrorCode] = useState<string | null>(null);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [health, setHealth] = useState<AnalyzerHealth | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [showConsent, setShowConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const canManualAnalyze = productName.trim().length > 0 && rawIngredients.trim().length > 0 && !busy;
  const hasSelectedImage = Boolean(frontImageUri || ingredientsImageUri);
  const remoteConsentAccepted = state.remoteAnalysisConsent.geminiImageTransferAccepted;

  useEffect(() => {
    ImagePicker.getPendingResultAsync()
      .then((pending) => {
        if (!pending || "code" in pending || pending.canceled || pending.assets.length === 0) {
          return;
        }
        setIngredientsImageUri(pending.assets[0]?.uri ?? null);
      })
      .catch(() => {
        setError("Android Activity 재생성 후 이미지 결과를 복구하지 못했어요. 다시 선택해 주세요.");
      });
  }, []);

  const runHealthCheck = useCallback(async () => {
    setHealthError(null);
    try {
      setHealth(await checkAnalyzerHealth(apiBaseUrl));
    } catch (caught) {
      const message = remoteAnalyzerErrorMessage(caught);
      setHealth(null);
      setHealthError(message);
      setRemoteErrorCode(caught instanceof Error && "code" in caught ? String(caught.code) : "HEALTH_CHECK_FAILED");
    }
  }, [apiBaseUrl]);

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
    setRemoteFailure(null);
    setRemoteErrorCode(null);
    try {
      const result = source === "camera" ? await launchCamera() : await launchGallery();
      if (!result) {
        return;
      }
      if (hint === "front") {
        setFrontImageUri(result);
        if (!ingredientsImageUri) {
          setFrontOnlyMessage("정확한 분석을 위해 전성분표 사진이나 직접 입력이 필요해요.");
        }
      } else {
        setIngredientsImageUri(result);
        setFrontOnlyMessage(null);
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "이미지 처리 중 오류가 발생했어요.";
      setError(`${message} 직접 입력 또는 샘플 제품으로 계속 진행할 수 있어요.`);
    } finally {
      setBusy(false);
    }
  }

  async function submitImageAnalysis(forceDemo = false, consentOverride = false) {
    if (busy) {
      return;
    }
    if (!hasSelectedImage) {
      setError("제품 앞면 또는 전성분표 이미지를 먼저 선택해 주세요.");
      return;
    }
    if (analyzerMode === "remote" && !forceDemo && !remoteConsentAccepted && !consentOverride) {
      setShowConsent(true);
      return;
    }
    setBusy(true);
    setError(null);
    setRemoteFailure(null);
    setRemoteErrorCode(null);
    try {
      const selectedFront = frontImageUri ? await prepareAnalyzerImage(frontImageUri, "front") : undefined;
      const selectedIngredients = ingredientsImageUri ? await prepareAnalyzerImage(ingredientsImageUri, "ingredients") : undefined;
      const activeAnalyzer = forceDemo ? new MockProductAnalyzer() : analyzer;
      const extraction = await activeAnalyzer.extractProductImages({
        frontImage: selectedFront,
        ingredientsImage: selectedIngredients,
        brandHint: brand || undefined,
        productNameHint: productName || undefined,
        categoryHint: category
      });
      setDraftExtraction(
        forceDemo
          ? {
              ...extraction,
              remoteFallbackNotice: "원격 분석에 실패해 데모 분석 결과를 표시하고 있어요."
            }
          : extraction
      );
      router.push("/scan/review");
    } catch (caught) {
      const message = remoteAnalyzerErrorMessage(caught);
      setRemoteFailure(message);
      setRemoteErrorCode(caught instanceof Error && "code" in caught ? String(caught.code) : "REMOTE_ANALYSIS_FAILED");
      setError(`${message} 선택한 이미지는 유지했어요. 다시 시도하거나 직접 입력 또는 데모 분석을 사용할 수 있어요.`);
    } finally {
      setBusy(false);
    }
  }

  function acceptRemoteConsent() {
    dispatch({ type: "setRemoteAnalysisConsent", value: true, updatedAt: new Date().toISOString() });
    setShowConsent(false);
    void submitImageAnalysis(false, true);
  }

  function revokeRemoteConsent() {
    dispatch({ type: "setRemoteAnalysisConsent", value: false, updatedAt: new Date().toISOString() });
    setShowConsent(false);
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
      imageUri: ingredientsImageUri ?? frontImageUri ?? undefined
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
        <View style={styles.previewRow}>
          {frontImageUri ? <Image source={{ uri: frontImageUri }} style={styles.preview} resizeMode="cover" /> : null}
          {ingredientsImageUri ? <Image source={{ uri: ingredientsImageUri }} style={styles.preview} resizeMode="cover" /> : null}
        </View>
        {frontOnlyMessage ? <Notice tone="warning">{frontOnlyMessage}</Notice> : null}
        {showConsent ? (
          <View style={styles.panel}>
            <SectionTitle>원격 이미지 분석 동의</SectionTitle>
            <BodyText>{REMOTE_CONSENT_COPY}</BodyText>
            <Button title="동의하고 분석" loading={busy} onPress={acceptRemoteConsent} />
            <Button title="동의하지 않음" variant="secondary" onPress={() => setShowConsent(false)} />
          </View>
        ) : null}
        <Button
          title={analyzerMode === "remote" ? "원격 이미지 분석 시작" : "이미지 데모 분석 시작"}
          testID="analyzer-remote-submit"
          disabled={!hasSelectedImage || busy}
          loading={busy}
          onPress={() => submitImageAnalysis()}
        />
        {remoteFailure ? (
          <View style={styles.panel}>
            <Tag tone="warning">{remoteErrorCode ?? "REMOTE_ANALYSIS_FAILED"}</Tag>
            <BodyText>{remoteFailure}</BodyText>
            <Button title="다시 시도" testID="analyzer-remote-retry" variant="secondary" loading={busy} onPress={() => submitImageAnalysis()} />
            <Button title="직접 전성분 입력" testID="analyzer-use-manual" variant="secondary" onPress={() => setError("아래 직접 입력 영역에서 제품명과 전성분을 입력해 주세요.")} />
            <Button title="데모 분석 사용" testID="analyzer-use-demo" variant="secondary" loading={busy} onPress={() => submitImageAnalysis(true)} />
            <Button title="서버 연결 확인" testID="analyzer-test-health" variant="secondary" onPress={runHealthCheck} />
          </View>
        ) : null}
      </Card>
      <Card>
        <Button
          title="분석 서버 연결 확인"
          testID="analyzer-diagnostics-open"
          variant="secondary"
          onPress={() => {
            setDiagnosticsOpen(!diagnosticsOpen);
            if (!diagnosticsOpen) {
              void runHealthCheck();
            }
          }}
        />
        {diagnosticsOpen ? (
          <View style={styles.diagnostics}>
            <BodyText>모드: {analyzerMode}</BodyText>
            <BodyText>API: {apiBaseUrl || "미설정"}</BodyText>
            <Text testID="analyzer-health-status" style={styles.diagnosticText}>
              상태: {health ? `정상 · ${health.responseTimeMs}ms · ${health.model} · Gemini ${health.geminiConfigured ? "설정됨" : "미설정"}` : healthError ?? "확인 전"}
            </Text>
            <BodyText>최근 오류 코드: {remoteErrorCode ?? "없음"}</BodyText>
            <BodyText>원격 이미지 동의: {remoteConsentAccepted ? "동의됨" : "미동의"}</BodyText>
            <Button title="다시 확인" testID="analyzer-test-health" variant="secondary" onPress={runHealthCheck} />
            {remoteConsentAccepted ? <Button title="원격 이미지 분석 동의 철회" variant="danger" onPress={revokeRemoteConsent} /> : null}
          </View>
        ) : null}
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
  previewRow: {
    flexDirection: "row",
    gap: 8
  },
  preview: {
    flex: 1,
    minHeight: 140,
    borderRadius: 8
  },
  diagnostics: {
    gap: 8
  },
  panel: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#DADCE0",
    borderRadius: 8,
    padding: 12,
    gap: 8
  },
  diagnosticText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#202124"
  }
});
