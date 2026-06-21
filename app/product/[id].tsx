import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert } from "react-native";
import { BodyText, Button, Card, Notice, OptionButton, OptionRow, Screen, SectionTitle, TextField } from "../../src/components/ui";
import { productCategories } from "../../src/copy/ko";
import type { BenefitCategory, ProductCategory } from "../../src/domain/types";
import { useAppState } from "../../src/state/AppContext";

const MEDICAL_REFERENCE_NOTICE =
  "This is a cosmetic ingredient reference based on the saved label and your profile. Real skin response can vary by formula concentration, usage, and personal condition.";

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
      <Screen title="Product Details">
        <Notice tone="warning">This product was deleted or could not be found.</Notice>
        <Button title="Go to My Vanity" onPress={() => router.replace("/(tabs)/vanity")} />
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
    Alert.alert("Delete product", `Remove ${currentProduct.name} from My Vanity?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          dispatch({ type: "deleteProduct", productId: currentProduct.id });
          router.replace("/(tabs)/vanity");
        }
      }
    ]);
  }

  return (
    <Screen title="Product Details" subtitle="Edit, save, finish, or delete this product. Changes update the analysis immediately.">
      <Notice>{MEDICAL_REFERENCE_NOTICE}</Notice>
      <Card>
        <TextField label="Brand" value={brand} onChangeText={setBrand} />
        <TextField label="Product name" value={name} onChangeText={setName} />
        <SectionTitle>Category</SectionTitle>
        <OptionRow>
          {productCategories.map((item) => (
            <OptionButton key={item} title={categoryEnglishLabels[item]} selected={category === item} onPress={() => setCategory(item)} />
          ))}
        </OptionRow>
        <TextField label="Ingredients" value={rawIngredients} onChangeText={setRawIngredients} multiline />
        <Button title="Save Changes" disabled={!name.trim() || !rawIngredients.trim()} onPress={save} />
      </Card>
      <Card>
        <SectionTitle>Current Analysis</SectionTitle>
        <BodyText>Primary benefits: {currentProduct.benefits.map((benefit) => benefitEnglishLabels[benefit]).join(", ") || "No major ingredient benefit matched"}</BodyText>
        <BodyText>Status: {currentProduct.status === "active" ? "Active in My Vanity" : "Finished"}</BodyText>
        <BodyText>Avoid-list matches: {currentProduct.analysis.avoidedMatches.join(", ") || "None"}</BodyText>
        <BodyText>Confidence: {Math.round(currentProduct.analysis.extractionConfidence * 100)}%</BodyText>
        <BodyText>Unmatched ingredients: {currentProduct.analysis.unmatchedCount}</BodyText>
        <Button title={currentProduct.status === "active" ? "Mark as Finished" : "Mark as Active"} variant="secondary" onPress={() => dispatch({ type: "toggleFinished", productId: currentProduct.id })} />
        <Button title="Delete Product" variant="danger" onPress={confirmDelete} />
      </Card>
    </Screen>
  );
}
