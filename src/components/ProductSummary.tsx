import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Product } from "../domain/types";
import { Card, Tag, colors } from "./ui";

const categoryLabels: Record<Product["category"], string> = {
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

const benefitLabels: Record<Product["benefits"][number], string> = {
  hydration: "Hydration",
  barrier: "Barrier",
  soothing: "Soothing",
  exfoliation: "Exfoliation",
  antioxidant: "Antioxidant",
  brightening: "Brightening",
  acneCare: "Acne care",
  antiAging: "Anti-aging",
  sunProtection: "Sun protection"
};

export function ProductSummary({
  product,
  onPress,
  testID
}: {
  product: Product;
  onPress?: () => void;
  testID?: string;
}) {
  const content = (
    <Card testID={testID} style={product.status === "finished" ? styles.finished : null}>
      <View style={styles.row}>
        <Text style={styles.name}>{product.brand} · {product.name}</Text>
        <Tag tone={product.source === "demo" ? "warning" : "default"}>{product.source === "demo" ? "Demo" : product.source}</Tag>
      </View>
      <Text style={styles.meta}>{categoryLabels[product.category]} · {product.benefits.map((benefit) => benefitLabels[benefit]).join(", ") || "No major benefit match"}</Text>
      {product.analysis.avoidedMatches.length > 0 ? <Text style={styles.warning}>Needs review for your settings: {product.analysis.avoidedMatches.join(", ")}</Text> : null}
      {product.status === "finished" ? <Text style={styles.meta}>Finished product</Text> : null}
    </Card>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`View ${product.name} details`} onPress={onPress}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  name: {
    flex: 1,
    color: colors.text,
    fontWeight: "800",
    fontSize: 16,
    lineHeight: 22
  },
  meta: {
    color: colors.muted,
    lineHeight: 20,
    fontSize: 14
  },
  warning: {
    color: colors.warning,
    lineHeight: 20,
    fontSize: 14
  },
  finished: {
    opacity: 0.7
  }
});
