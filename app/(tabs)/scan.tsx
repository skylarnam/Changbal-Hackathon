import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { BodyText, Button, Card, colors, InlineError, Notice, OptionButton, OptionRow, Screen, SectionTitle, Tag, TextField } from "../../src/components/ui";
import { productCategories } from "../../src/copy/ko";
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
  "Product and ingredient-label images may be sent to Google Gemini for analysis. Do not upload images containing faces, skin photos, names, contact details, or other personal information.";

const categoryEnglishLabels: Record<ProductCategory, string> = {
  cleanser: "Cleanser",
  toner: "Toner",
  essence: "Essence",
  serum: "Serum",
  treatment: "Treatment",
  moisturizer: "Moisturizer",
  sunscreen: "Sunscreen",
  mask: "Mask",
  oil: "Oil",
  other: "Other"
};

export default function ScanScreen() {
  const params = useLocalSearchParams<{ mode?: string; auto?: string }>();
  const { state, dispatch, setDraftExtraction } = useAppState();
  const autoLaunchRef = useRef(false);
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
  const [capturedPreviewUri, setCapturedPreviewUri] = useState<string | null>(null);

  const canManualAnalyze = productName.trim().length > 0 && rawIngredients.trim().length > 0 && !busy;
  const hasSelectedImage = Boolean(frontImageUri || ingredientsImageUri);
  const remoteConsentAccepted = state.remoteAnalysisConsent.geminiImageTransferAccepted;
  const scanMode = params.mode === "front" || params.mode === "ingredients" ? params.mode : null;

  useEffect(() => {
    if (!scanMode || params.auto !== "1" || autoLaunchRef.current) {
      return;
    }
    autoLaunchRef.current = true;
    const timer = setTimeout(() => {
      void captureAndAnalyze("camera", scanMode);
    }, 250);
    return () => clearTimeout(timer);
  }, [params.auto, scanMode]);

  useEffect(() => {
    ImagePicker.getPendingResultAsync()
      .then((pending) => {
        if (!pending || "code" in pending || pending.canceled || pending.assets.length === 0) {
          return;
        }
        setIngredientsImageUri(pending.assets[0]?.uri ?? null);
      })
      .catch(() => {
        setError("We could not restore the image after Android recreated the activity. Please select it again.");
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
          setFrontOnlyMessage("For accurate analysis, add an ingredient-list photo or enter ingredients manually.");
        }
      } else {
        setIngredientsImageUri(result);
        setFrontOnlyMessage(null);
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Something went wrong while processing the image.";
      setError(`${message} You can continue with manual entry or a sample product.`);
    } finally {
      setBusy(false);
    }
  }

  async function submitImageAnalysis(forceDemo = false, consentOverride = false) {
    if (busy) {
      return;
    }
    if (!hasSelectedImage) {
      setError("Select a product-front or ingredient-list image first.");
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
              remoteFallbackNotice: "Remote analysis failed, so demo analysis is shown."
            }
          : extraction
      );
      router.push("/scan/review");
    } catch (caught) {
      const message = remoteAnalyzerErrorMessage(caught);
      setRemoteFailure(message);
      setRemoteErrorCode(caught instanceof Error && "code" in caught ? String(caught.code) : "REMOTE_ANALYSIS_FAILED");
      setError(`${message} Your selected image is still saved. Try again, use manual entry, or use demo analysis.`);
    } finally {
      setBusy(false);
    }
  }

  async function captureAndAnalyze(source: "camera" | "gallery", hint: "front" | "ingredients", forceDemo = false, consentOverride = false) {
    if (busy) {
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
      const uri = source === "camera" ? await launchCamera() : await launchGallery();
      if (!uri) {
        return;
      }
      setCapturedPreviewUri(uri);
      if (hint === "front") {
        setFrontImageUri(uri);
      } else {
        setIngredientsImageUri(uri);
      }
      const image = await prepareAnalyzerImage(uri, hint);
      const activeAnalyzer = forceDemo ? new MockProductAnalyzer() : analyzer;
      let extraction: AnalyzerExtraction;
      try {
        extraction = await activeAnalyzer.extractProductImages({
          frontImage: hint === "front" ? image : undefined,
          ingredientsImage: hint === "ingredients" ? image : undefined,
          categoryHint: category
        });
      } catch (analysisError) {
        const message = remoteAnalyzerErrorMessage(analysisError);
        setRemoteFailure(null);
        setRemoteErrorCode(analysisError instanceof Error && "code" in analysisError ? String(analysisError.code) : "REMOTE_FALLBACK_USED");
        extraction = fallbackExtractionForScan(hint, uri, message);
      }
      setDraftExtraction(forceDemo ? fallbackExtractionForScan(hint, uri, "Demo analysis is shown.") : extraction);
      router.push("/scan/review");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "We could not capture that image.";
      setRemoteFailure(null);
      setRemoteErrorCode("IMAGE_CAPTURE_FAILED");
      setError(`${message} Try again, choose a photo, or use demo analysis.`);
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

  function acceptScannerConsent() {
    if (!scanMode) {
      return;
    }
    dispatch({ type: "setRemoteAnalysisConsent", value: true, updatedAt: new Date().toISOString() });
    setShowConsent(false);
    void captureAndAnalyze("camera", scanMode, false, true);
  }

  function submitManual() {
    if (!canManualAnalyze) {
      setError("Enter a product name and ingredients before analyzing.");
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

  if (scanMode) {
    return (
      <OcrScannerScreen
        mode={scanMode}
        busy={busy}
        error={error}
        remoteFailure={remoteFailure}
        capturedImageUri={capturedPreviewUri}
        showConsent={showConsent}
        onBack={() => router.back()}
        onCapture={() => captureAndAnalyze("camera", scanMode)}
        onGallery={() => captureAndAnalyze("gallery", scanMode)}
        onDemo={() => selectSample(scanMode === "front" ? "barrier" : "hydration")}
        onAcceptConsent={acceptScannerConsent}
        onDismissConsent={() => setShowConsent(false)}
      />
    );
  }

  return (
    <Screen eyebrow="Scan ritual" title="Analyze a product in seconds." subtitle="Use an ingredient-label photo, a sample product, or manual entry to start analysis.">
      <Notice>Manual entry always works without photos. If the API is unavailable, the app can fall back to demo analysis.</Notice>
      <Card>
        <SectionTitle>Image path</SectionTitle>
        <Button
          title="Scan product front"
          testID="scan-camera-front"
          variant="secondary"
          loading={busy}
          onPress={() => pickImage("camera", "front")}
        />
        <Button
          title="Scan ingredient list"
          testID="scan-camera-ingredients"
          variant="secondary"
          loading={busy}
          onPress={() => pickImage("camera", "ingredients")}
        />
        <Button
          title="Choose product front from gallery"
          testID="scan-gallery-front"
          variant="secondary"
          loading={busy}
          onPress={() => pickImage("gallery", "front")}
        />
        <Button
          title="Choose ingredient list from gallery"
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
            <SectionTitle>Remote image analysis consent</SectionTitle>
            <BodyText>{REMOTE_CONSENT_COPY}</BodyText>
            <Button title="Agree and analyze" loading={busy} onPress={acceptRemoteConsent} />
            <Button title="Not now" variant="secondary" onPress={() => setShowConsent(false)} />
          </View>
        ) : null}
        <Button
          title={analyzerMode === "remote" ? "Start remote image analysis" : "Start demo image analysis"}
          testID="analyzer-remote-submit"
          disabled={!hasSelectedImage || busy}
          loading={busy}
          onPress={() => submitImageAnalysis()}
        />
        {remoteFailure ? (
          <View style={styles.panel}>
            <Tag tone="warning">{remoteErrorCode ?? "REMOTE_ANALYSIS_FAILED"}</Tag>
            <BodyText>{remoteFailure}</BodyText>
            <Button title="Try again" testID="analyzer-remote-retry" variant="secondary" loading={busy} onPress={() => submitImageAnalysis()} />
            <Button title="Enter ingredients manually" testID="analyzer-use-manual" variant="secondary" onPress={() => setError("Use the manual entry section below to enter product name and ingredients.")} />
            <Button title="Use demo analysis" testID="analyzer-use-demo" variant="secondary" loading={busy} onPress={() => submitImageAnalysis(true)} />
            <Button title="Check server connection" testID="analyzer-test-health" variant="secondary" onPress={runHealthCheck} />
          </View>
        ) : null}
      </Card>
      <Card>
        <Button
          title="Check analysis server"
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
            <BodyText>Mode: {analyzerMode}</BodyText>
            <BodyText>API: {apiBaseUrl || "not configured"}</BodyText>
            <Text testID="analyzer-health-status" style={styles.diagnosticText}>
              Status: {health ? `OK · ${health.responseTimeMs}ms · ${health.model} · Gemini ${health.geminiConfigured ? "configured" : "not configured"}` : healthError ?? "not checked"}
            </Text>
            <BodyText>Latest error code: {remoteErrorCode ?? "none"}</BodyText>
            <BodyText>Remote image consent: {remoteConsentAccepted ? "accepted" : "not accepted"}</BodyText>
            <Button title="Check again" testID="analyzer-test-health" variant="secondary" onPress={runHealthCheck} />
            {remoteConsentAccepted ? <Button title="Revoke remote image consent" variant="danger" onPress={revokeRemoteConsent} /> : null}
          </View>
        ) : null}
      </Card>
      <Card>
        <SectionTitle>Quick sample tests</SectionTitle>
        <Button title="Hydrating calming serum" testID="scan-demo-hydration" onPress={() => selectSample("hydration")} />
        <Button title="Barrier cream" testID="scan-demo-barrier" variant="secondary" onPress={() => selectSample("barrier")} />
        <Button title="Retinol serum" testID="scan-demo-retinol" variant="secondary" onPress={() => selectSample("retinol")} />
        <Button title="Exfoliation sample" variant="secondary" onPress={() => selectSample("lactic")} />
      </Card>
      <Card>
        <SectionTitle>Manual entry</SectionTitle>
        <TextField label="Brand" value={brand} onChangeText={setBrand} placeholder="Optional" testID="scan-manual-brand" />
        <TextField label="Product name" value={productName} onChangeText={setProductName} placeholder="Example: hydrating calming serum" testID="scan-manual-entry" />
        <OptionRow>
          {productCategories.map((item) => (
            <OptionButton key={item} title={categoryEnglishLabels[item]} selected={category === item} onPress={() => setCategory(item)} />
          ))}
        </OptionRow>
        <TextField
          label="Ingredients"
          value={rawIngredients}
          onChangeText={setRawIngredients}
          placeholder="Separate with commas, semicolons, or line breaks"
          multiline
          testID="scan-manual-ingredients"
        />
        <Button title="Review analysis" testID="scan-analyze" disabled={!canManualAnalyze} loading={busy} onPress={submitManual} />
      </Card>
      <InlineError message={error} />
    </Screen>
  );
}

function fallbackExtractionForScan(hint: "front" | "ingredients", imageUri: string, reason: string): AnalyzerExtraction {
  const sample = hint === "front" ? sampleExtractions.barrier : sampleExtractions.hydration;
  return {
    ...sample,
    source: "demo",
    imageUri,
    remoteFallbackNotice: `${englishAnalyzerMessage(reason)} Demo analysis is shown so you can continue testing the flow.`
  };
}

function englishAnalyzerMessage(message: string): string {
  if (!message) {
    return "Remote analysis was unavailable.";
  }
  if (/[가-힣]/.test(message)) {
    return "Remote analysis was unavailable.";
  }
  return message;
}

function OcrScannerScreen({
  mode,
  busy,
  error,
  remoteFailure,
  showConsent,
  onBack,
  capturedImageUri,
  onCapture,
  onGallery,
  onDemo,
  onAcceptConsent,
  onDismissConsent
}: {
  mode: "front" | "ingredients";
  busy: boolean;
  error: string | null;
  remoteFailure: string | null;
  capturedImageUri: string | null;
  showConsent: boolean;
  onBack: () => void;
  onCapture: () => void;
  onGallery: () => void;
  onDemo: () => void;
  onAcceptConsent: () => void;
  onDismissConsent: () => void;
}) {
  const isIngredients = mode === "ingredients";

  return (
    <View style={styles.scannerShell}>
      <View style={styles.scannerPhone}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" style={styles.scannerBackHitbox} onPress={onBack}>
          <Text style={styles.scannerBackText}>Back</Text>
        </Pressable>
        <Text style={styles.scannerMode}>SCAN MODE</Text>

        <View style={styles.scannerPreview}>
          <View style={styles.ocrBadge}>
            <Text style={styles.ocrBadgeText}>{busy ? "SEARCHING ONLINE" : "OCR ACTIVATE"}</Text>
          </View>
          <View style={styles.scanFrame}>
            {capturedImageUri ? <Image source={{ uri: capturedImageUri }} style={styles.capturedPreview} resizeMode="cover" /> : null}
            {!capturedImageUri ? (
              <>
                <Text style={styles.frameTitle}>{isIngredients ? "INGREDIENTS" : "PRODUCT FRONT"}</Text>
                <Text style={styles.frameBody}>
                  {isIngredients
                    ? "Point the camera at the full ingredient list."
                    : "Point the camera at the product name, brand, and label."}
                </Text>
              </>
            ) : null}
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
            <View style={styles.scanLine} />
          </View>
        </View>

        <View style={styles.scannerCopy}>
          <Text style={styles.scannerInstruction}>{isIngredients ? "Align ingredient list inside the box." : "Align product label inside the box."}</Text>
          <Text style={styles.scannerSubcopy}>{busy ? "Reading OCR and matching products..." : "Hold steady, then tap capture."}</Text>
          {showConsent ? (
            <View style={styles.consentCard}>
              <Text style={styles.consentTitle}>Remote image analysis consent</Text>
              <Text style={styles.consentBody}>{REMOTE_CONSENT_COPY}</Text>
              <Pressable style={styles.consentButton} onPress={onAcceptConsent}>
                <Text style={styles.consentButtonText}>Agree and scan</Text>
              </Pressable>
              <Pressable style={styles.consentSecondary} onPress={onDismissConsent}>
                <Text style={styles.consentSecondaryText}>Not now</Text>
              </Pressable>
            </View>
          ) : null}
          {error || remoteFailure ? <Text style={styles.scannerError}>{error || remoteFailure}</Text> : null}
        </View>

        <View style={styles.scannerActions}>
          <Pressable accessibilityRole="button" style={styles.galleryButton} disabled={busy} onPress={onGallery}>
            <Text style={styles.galleryButtonText}>Gallery</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Capture scan" style={[styles.shutter, busy && styles.shutterBusy]} disabled={busy} onPress={onCapture}>
            <View style={styles.shutterInner} />
          </Pressable>
          <Pressable accessibilityRole="button" style={styles.galleryButton} disabled={busy} onPress={onDemo}>
            <Text style={styles.galleryButtonText}>Demo</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

async function launchCamera(): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    if (!permission.canAskAgain) {
      throw new Error(`${Platform.OS === "ios" ? "iOS" : "Android"} camera permission cannot be requested again. Enable it in Settings or use manual entry.`);
    }
    throw new Error("Camera permission was denied.");
  }
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: false,
    quality: 0.7,
    mediaTypes: ImagePicker.MediaTypeOptions.Images
  });
  if (result.canceled) {
    throw new Error("Camera capture was cancelled.");
  }
  return result.assets[0]?.uri ?? null;
}

async function launchGallery(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    if (!permission.canAskAgain) {
      throw new Error(`${Platform.OS === "ios" ? "iOS" : "Android"} gallery permission cannot be requested again. Enable it in Settings or use manual entry.`);
    }
    throw new Error("Gallery permission was denied.");
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: false,
    quality: 0.7,
    mediaTypes: ImagePicker.MediaTypeOptions.Images
  });
  if (result.canceled) {
    throw new Error("Gallery selection was cancelled.");
  }
  return result.assets[0]?.uri ?? null;
}

const styles = StyleSheet.create({
  scannerShell: {
    flex: 1,
    backgroundColor: "#EEE9DF",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18
  },
  scannerPhone: {
    flex: 1,
    borderRadius: 42,
    borderWidth: 10,
    borderColor: colors.text,
    backgroundColor: "#3F403A",
    overflow: "hidden",
    paddingHorizontal: 26,
    paddingTop: 36,
    paddingBottom: 34
  },
  scannerBackHitbox: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingRight: 16,
    marginBottom: 8
  },
  scannerBackText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    fontWeight: "800"
  },
  scannerMode: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 8,
    textAlign: "center"
  },
  scannerPreview: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24
  },
  ocrBadge: {
    borderRadius: 999,
    backgroundColor: "#6F966F",
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 22
  },
  ocrBadgeText: {
    color: "white",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 6
  },
  scanFrame: {
    width: "86%",
    minHeight: 278,
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: "#DED8C8",
    padding: 32,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 }
  },
  capturedPreview: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%"
  },
  corner: {
    position: "absolute",
    width: 34,
    height: 34,
    borderColor: "white"
  },
  cornerTopLeft: {
    top: -4,
    left: -4,
    borderLeftWidth: 6,
    borderTopWidth: 6,
    borderTopLeftRadius: 6
  },
  cornerTopRight: {
    top: -4,
    right: -4,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderTopRightRadius: 6
  },
  cornerBottomLeft: {
    bottom: -4,
    left: -4,
    borderLeftWidth: 6,
    borderBottomWidth: 6,
    borderBottomLeftRadius: 6
  },
  cornerBottomRight: {
    bottom: -4,
    right: -4,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderBottomRightRadius: 6
  },
  frameTitle: {
    color: "#5E594E",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 5,
    marginBottom: 20
  },
  frameBody: {
    color: "#3E3A34",
    fontSize: 16,
    lineHeight: 24
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "52%",
    height: 3,
    backgroundColor: "#6F966F"
  },
  scannerCopy: {
    alignItems: "center",
    gap: 10,
    marginBottom: 22
  },
  scannerInstruction: {
    color: "white",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
    textAlign: "center"
  },
  scannerSubcopy: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "700",
    textAlign: "center"
  },
  scannerError: {
    color: "#FFD2C0",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 4
  },
  scannerActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  shutter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 7,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)"
  },
  shutterBusy: {
    opacity: 0.58
  },
  shutterInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.text
  },
  galleryButton: {
    minWidth: 76,
    alignItems: "center",
    paddingVertical: 12
  },
  galleryButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "900"
  },
  consentCard: {
    width: "100%",
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.94)",
    padding: 16,
    gap: 10,
    marginTop: 8
  },
  consentTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  consentBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19
  },
  consentButton: {
    borderRadius: 999,
    backgroundColor: "#6F966F",
    alignItems: "center",
    paddingVertical: 11
  },
  consentButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "900"
  },
  consentSecondary: {
    alignItems: "center",
    paddingVertical: 6
  },
  consentSecondaryText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800"
  },
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
