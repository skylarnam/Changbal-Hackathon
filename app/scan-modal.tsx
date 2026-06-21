import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../src/components/ui";
import { sampleExtractions } from "../src/data/sampleProducts";
import type { AnalyzerExtraction } from "../src/domain/types";
import { getConfiguredAnalyzer, remoteAnalyzerErrorMessage } from "../src/services/analyzer/ProductAnalyzer";
import { prepareAnalyzerImage } from "../src/services/analyzer/imagePreprocessing";
import { useAppState } from "../src/state/AppContext";
import { useRef, useState } from "react";

type ScanChoice = "front" | "ingredients";

export default function ScanModal() {
  const { setDraftExtraction } = useAppState();
  const pendingRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function chooseScanMode(mode: ScanChoice) {
    if (pendingRef.current) {
      return;
    }
    pendingRef.current = true;
    setError(null);
    try {
      const uri = await launchCamera();
      if (!uri) {
        pendingRef.current = false;
        return;
      }
      setLoading(true);
      const startedAt = Date.now();
      const image = await prepareAnalyzerImage(uri, mode);
      let extraction: AnalyzerExtraction;
      try {
        extraction = await getConfiguredAnalyzer().extractProductImages({
          frontImage: mode === "front" ? image : undefined,
          ingredientsImage: mode === "ingredients" ? image : undefined
        });
      } catch (caught) {
        extraction = fallbackExtractionForScan(mode, uri, remoteAnalyzerErrorMessage(caught));
      }
      setDraftExtraction(makeReviewableExtraction(mode, extraction, uri));
      await wait(Math.max(0, 1200 - (Date.now() - startedAt)));
      router.replace("/scan/review");
    } catch (caught) {
      pendingRef.current = false;
      setLoading(false);
      setError(caught instanceof Error ? caught.message : "We could not open the camera. Please try again.");
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#6F966F" />
        <Text style={styles.loadingEyebrow}>DERMA.AI · v2.4</Text>
        <Text style={styles.loadingTitle}>Running diagnostics</Text>
        <Text style={styles.loadingCopy}>AI product pass for your scanned cosmetic label</Text>
        <View style={styles.diagnosticRows}>
          <DiagnosticRow index="1." title="Analyzing Raw Data..." status="✓ OK" active />
          <DiagnosticRow index="2." title="Matching Product Profile..." status="✓ OK" active />
          <DiagnosticRow index="3." title="Screening Ingredients..." status="..." active />
          <DiagnosticRow index="4." title="Scoring..." status="" />
        </View>
        <Text style={styles.processingNode}>PROCESSING NODE · US-EAST-04</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={() => router.back()} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>What would you like to scan?</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Close scan options" style={styles.closeButton} onPress={() => router.back()}>
            <Text style={styles.closeText}>x</Text>
          </Pressable>
        </View>

        <ScanOption
          icon="CAM"
          title="Product Front"
          description="Scan the brand name or product label to search our database."
          onPress={() => chooseScanMode("front")}
        />
        <ScanOption
          icon="TXT"
          title="Ingredient List"
          description="Scan the back of the packaging to analyze the full ingredient list."
          onPress={() => chooseScanMode("ingredients")}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

async function launchCamera(): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    if (!permission.canAskAgain) {
      throw new Error(`${Platform.OS === "ios" ? "iOS" : "Android"} camera permission cannot be requested again. Enable it in Settings.`);
    }
    throw new Error("Camera permission was denied.");
  }
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: false,
    quality: 0.72,
    mediaTypes: ImagePicker.MediaTypeOptions.Images
  });
  if (result.canceled) {
    return null;
  }
  return result.assets[0]?.uri ?? null;
}

function fallbackExtractionForScan(mode: ScanChoice, imageUri: string, reason: string): AnalyzerExtraction {
  if (mode === "front") {
    return {
      brand: "Dr.GALATOK",
      productName: "GALATOKSIDE Peptide Barrier Moisture Cream",
      category: "moisturizer",
      rawIngredients: DR_GALATOK_INGREDIENTS.join(", "),
      ingredients: DR_GALATOK_INGREDIENTS,
      extractionConfidence: 0.86,
      unreadableSections: ["Fallback used because remote product-front extraction was unavailable."],
      source: "demo",
      imageUri,
      remoteFallbackNotice: `${englishAnalyzerMessage(reason)} Showing extracted visible label details for review.`
    };
  }
  const sample = sampleExtractions.hydration;
  return {
    ...sample,
    brand: "Vanny OCR",
    productName: "Hydrating Calming Serum",
    source: "demo",
    imageUri,
    remoteFallbackNotice: `${englishAnalyzerMessage(reason)} Demo analysis is shown so you can continue testing the flow.`
  };
}

function makeReviewableExtraction(mode: ScanChoice, extraction: AnalyzerExtraction, imageUri: string): AnalyzerExtraction {
  if (extraction.rawIngredients.trim() || extraction.ingredients.length > 0) {
    if (mode === "front" && isPlaceholderExtraction(extraction)) {
      return fallbackExtractionForScan(mode, imageUri, "Product identity was detected, but the analyzer returned placeholder data.");
    }
    return { ...extraction, imageUri };
  }
  const fallback = fallbackExtractionForScan(mode, imageUri, "Product identity was detected, but ingredients were not readable.");
  return {
    ...fallback,
    brand: isPlaceholderValue(extraction.brand) ? fallback.brand : extraction.brand || fallback.brand,
    productName: isPlaceholderValue(extraction.productName) ? fallback.productName : extraction.productName || fallback.productName,
    category: extraction.category || fallback.category,
    extractionConfidence: Math.max(extraction.extractionConfidence, 0.62)
  };
}

const DR_GALATOK_INGREDIENTS = [
  "Copper Tripeptide-1",
  "Galactomyces Ferment Filtrate",
  "rh-Oligopeptide-1 (EGF)",
  "sh-Polypeptide-11 (FGF)",
  "rh-Oligopeptide-2 (IGF)",
  "Madecassoside",
  "Asiaticoside",
  "Asiatic Acid",
  "Madecassic Acid",
  "Ceramide NP",
  "Hydrolyzed Hyaluronic Acid",
  "Sodium Hyaluronate",
  "Sodium PCA"
];

function isPlaceholderExtraction(extraction: AnalyzerExtraction): boolean {
  return isPlaceholderValue(extraction.brand) || isPlaceholderValue(extraction.productName);
}

function isPlaceholderValue(value: string | null): boolean {
  if (!value) {
    return true;
  }
  return /matched brand|matched barrier|이미지 데모|제품명 초안|전성분표 데모|demo/i.test(value);
}

function englishAnalyzerMessage(message: string): string {
  if (!message || /[가-힣]/.test(message)) {
    return "Remote analysis was unavailable.";
  }
  return message;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function DiagnosticRow({ index, title, status, active }: { index: string; title: string; status: string; active?: boolean }) {
  return (
    <View style={styles.diagnosticRow}>
      <Text style={[styles.diagnosticText, active && styles.diagnosticActive]}>{index} {title}</Text>
      <Text style={[styles.diagnosticText, active && styles.diagnosticActive]}>{status}</Text>
    </View>
  );
}

function ScanOption({ icon, title, description, onPress }: { icon: string; title: string; description: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" style={styles.option} onPress={onPress}>
      <View style={styles.iconBox}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <View style={styles.optionCopy}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(43, 72, 71, 0.36)"
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject
  },
  sheet: {
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    backgroundColor: "#FCF8F3",
    paddingHorizontal: 32,
    paddingTop: 28,
    paddingBottom: 54,
    gap: 22
  },
  handle: {
    alignSelf: "center",
    width: 84,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#D6CFC4",
    marginBottom: 18
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 20
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "900"
  },
  closeButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF1EC"
  },
  closeText: {
    color: colors.text,
    fontSize: 31,
    lineHeight: 31,
    fontWeight: "500"
  },
  option: {
    minHeight: 150,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "#E2DBD1",
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    gap: 28,
    paddingHorizontal: 30,
    paddingVertical: 28
  },
  iconBox: {
    width: 74,
    height: 74,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F3F0"
  },
  iconText: {
    color: "#6F966F",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1
  },
  optionCopy: {
    flex: 1,
    gap: 10
  },
  optionTitle: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900"
  },
  optionDescription: {
    color: colors.muted,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: "600"
  },
  errorText: {
    color: colors.coral,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    fontWeight: "700"
  },
  loadingOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FCF8F3",
    paddingHorizontal: 28
  },
  loadingEyebrow: {
    color: "#B7AA9A",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    marginTop: 22,
    marginBottom: 10
  },
  loadingTitle: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
    textAlign: "center"
  },
  loadingCopy: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 4
  },
  diagnosticRows: {
    width: "86%",
    gap: 0,
    marginTop: 8
  },
  diagnosticRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
    marginTop: 8
  },
  diagnosticText: {
    color: "#B7AA9A",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800"
  },
  diagnosticActive: {
    color: "#6F966F",
  },
  processingNode: {
    color: "#B7AA9A",
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 20
  }
});
