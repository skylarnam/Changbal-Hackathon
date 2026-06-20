import { Pressable, StyleSheet, Text, View } from "react-native";
import { benefitLabels, categoryLabels } from "../copy/ko";
import type { Product } from "../domain/types";
import { Card, Tag, colors } from "./ui";

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
        <Tag tone={product.source === "demo" ? "warning" : "default"}>{product.source === "demo" ? "데모" : product.source}</Tag>
      </View>
      <Text style={styles.meta}>{categoryLabels[product.category]} · {product.benefits.map((benefit) => benefitLabels[benefit]).join(", ") || "주요 기능 매칭 없음"}</Text>
      {product.analysis.avoidedMatches.length > 0 ? <Text style={styles.warning}>내 설정상 확인 필요: {product.analysis.avoidedMatches.join(", ")}</Text> : null}
      {product.status === "finished" ? <Text style={styles.meta}>사용 완료 제품</Text> : null}
    </Card>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${product.name} 상세 보기`} onPress={onPress}>
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
    fontWeight: "700",
    fontSize: 16
  },
  meta: {
    color: colors.muted,
    lineHeight: 20
  },
  warning: {
    color: colors.warning,
    lineHeight: 20
  },
  finished: {
    opacity: 0.7
  }
});
