import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { BodyText, Button, Card, InlineError, Notice, OptionButton, OptionRow, Screen, SectionTitle, Tag, TextField } from "../../src/components/ui";
import { productCategories } from "../../src/copy/ko";
import { createProductFromExtraction, analyzeProduct } from "../../src/domain/productAnalysis";
import type { AnalyzerExtraction, BenefitCategory, ProductAnalysisResult, ProductCategory } from "../../src/domain/types";
import { useAppState } from "../../src/state/AppContext";

const MEDICAL_REFERENCE_NOTICE =
  "This is a cosmetic ingredient reference based on the scanned label and your profile. Real skin response can vary by formula concentration, usage, and personal condition.";

const categoryEnglishLabels: Record<ProductCategory, string> = {
  cleanser: "Cleanser",
  toner: "Toner",
  essence: "Essence",
  serum: "Serum",
  treatment: "Treatment",
  moisturizer: "Cream / Moisturizer",
  sunscreen: "Sunscreen",
  mask: "Mask",
  oil: "Oil",
  other: "Other"
};

const benefitEnglishLabels: Record<BenefitCategory, string> = {
  hydration: "Hydration",
  barrier: "Barrier support",
  soothing: "Soothing",
  exfoliation: "Exfoliation",
  antioxidant: "Antioxidant",
  brightening: "Tone / brightening support",
  acneCare: "Oil / blemish support",
  antiAging: "Firmness / aging support",
  sunProtection: "UV protection"
};

export default function ReviewScreen() {
  const { draftExtraction, setDraftExtraction, state, dispatch } = useAppState();
  const [brand, setBrand] = useState(draftExtraction?.brand ?? "");
  const [productName, setProductName] = useState(draftExtraction?.productName ?? "");
  const [category, setCategory] = useState<ProductCategory>(draftExtraction?.category ?? "serum");
  const [rawIngredients, setRawIngredients] = useState(draftExtraction?.rawIngredients ?? "");
  const [ingredientList, setIngredientList] = useState((draftExtraction?.ingredients ?? []).join("\n"));
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
  const analysis: ProductAnalysisResult | null = useMemo(() => (editedExtraction && canConfirm ? analyzeProduct(editedExtraction, state.profile) : null), [canConfirm, editedExtraction, state.profile]);
  const productSummary = useMemo(() => buildProductSummary(editedExtraction, analysis), [analysis, editedExtraction]);

  function validateBeforeAdd(): boolean {
    if (!editedExtraction || !canConfirm) {
      setError("Product name and ingredients are required before adding this to My Vanity.");
      return false;
    }
    setError(null);
    return true;
  }

  function addToVanity() {
    if (!editedExtraction || !analysis || added || !validateBeforeAdd()) {
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
      <Screen title="Review Analysis">
        <Notice tone="warning">There is no scanned product to review. Start again from Scan.</Notice>
        <Button title="Go to Scan" onPress={() => router.replace("/(tabs)/scan")} />
      </Screen>
    );
  }

  return (
    <Screen title="Review Analysis" subtitle="Check the AI product match, edit anything that looks off, then add it to My Vanity.">
      <Notice>{MEDICAL_REFERENCE_NOTICE}</Notice>
      {draftExtraction.remoteFallbackNotice ? <Notice tone="warning">{draftExtraction.remoteFallbackNotice}</Notice> : null}
      {draftExtraction.source === "demo" ? <Tag tone="warning">AI fallback result</Tag> : <Tag tone="success">AI extracted result</Tag>}

      <Card>
        <SectionTitle>Product lookup summary</SectionTitle>
        <View style={styles.summaryHeader}>
          <View style={styles.matchBadge}>
            <Text style={styles.matchBadgeText}>{productSummary.matchLabel}</Text>
          </View>
          <Text style={styles.summaryTitle}>{productSummary.title}</Text>
        </View>
        <BodyText>{productSummary.description}</BodyText>
        <BodyText muted>{productSummary.sourceNote}</BodyText>
      </Card>

      <Card>
        <SectionTitle>Editable product details</SectionTitle>
        <TextField label="Brand" value={brand} onChangeText={setBrand} placeholder="Unknown brand" />
        <TextField label="Product name" value={productName} onChangeText={setProductName} placeholder="Product name" />
        <SectionTitle>Product category</SectionTitle>
        <OptionRow>
          {productCategories.map((item) => (
            <OptionButton key={item} title={categoryEnglishLabels[item]} selected={category === item} onPress={() => setCategory(item)} />
          ))}
        </OptionRow>
        <TextField label="Raw ingredient text" value={rawIngredients} onChangeText={setRawIngredients} multiline />
        <TextField label="Ingredient list" value={ingredientList} onChangeText={setIngredientList} multiline />
      </Card>
      {analysis ? (
        <Card testID="scan-analysis-result">
          <SectionTitle>Ingredient analysis</SectionTitle>
          <BodyText>Primary benefits: {formatBenefits(analysis.benefits)}</BodyText>
          <BodyText>Profile match: {analysis.concernFlags.length > 0 ? `${analysis.concernFlags.length} concern match(es)` : "No direct concern matches yet"}</BodyText>
          <BodyText>Avoid-list matches: {analysis.avoidedMatches.join(", ") || "None"}</BodyText>
          <BodyText>Confidence: {Math.round(analysis.extractionConfidence * 100)}%</BodyText>
          <BodyText>Unmatched ingredients: {analysis.unmatchedCount}</BodyText>
          <Text style={styles.bullet}>- Concentration and full formula context may not be visible from the image.</Text>
          <Text style={styles.bullet}>- Use this as a review aid, not medical advice.</Text>
          <Button title={added ? "Added to My Vanity" : "Add to My Vanity"} testID="scan-confirm-add" onPress={addToVanity} disabled={added || !canConfirm} />
        </Card>
      ) : null}
      <InlineError message={error} />
    </Screen>
  );
}

function formatBenefits(benefits: BenefitCategory[]): string {
  return benefits.length > 0 ? benefits.map((benefit) => benefitEnglishLabels[benefit]).join(", ") : "No major ingredient benefit matched";
}

function buildProductSummary(extraction: AnalyzerExtraction | null, analysis: ProductAnalysisResult | null): {
  matchLabel: string;
  title: string;
  description: string;
  sourceNote: string;
} {
  if (!extraction) {
    return {
      matchLabel: "No scan",
      title: "No product detected",
      description: "Scan a product front or ingredient label to generate an analysis.",
      sourceNote: "No image result is available."
    };
  }

  const brand = extraction.brand || "Unknown brand";
  const name = extraction.productName || "Unknown product";
  const category = extraction.category ? categoryEnglishLabels[extraction.category] : "Cosmetic product";
  const confidence = Math.round((analysis?.extractionConfidence ?? extraction.extractionConfidence) * 100);

  return {
    matchLabel: `${confidence}% match`,
    title: `${brand} · ${name}`,
    description: `${category}. The scan matched the visible label and ingredient text, then screened the ingredient list for likely cosmetic functions such as hydration, barrier support, soothing, and peptide-focused repair claims.`,
    sourceNote:
      extraction.source === "ai"
        ? "Source: AI visual extraction from your scan. Review before saving."
        : "Source: AI fallback/product-label match for this scan. Review and edit before saving."
  };
}

const styles = StyleSheet.create({
  summaryHeader: {
    gap: 10,
    marginBottom: 10
  },
  matchBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#EDF1EA",
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  matchBadgeText: {
    color: "#6F966F",
    fontSize: 13,
    fontWeight: "900"
  },
  summaryTitle: {
    color: "#2D5552",
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "900"
  },
  bullet: {
    color: "#8F8375",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8
  }
});
