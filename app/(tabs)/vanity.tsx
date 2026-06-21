import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { colors } from "../../src/components/ui";
import { createDemoProduct } from "../../src/data/sampleProducts";
import type { Product } from "../../src/domain/types";
import { useAppState } from "../../src/state/AppContext";

type VanityGroup = "hydrators" | "tools" | "serums" | "creams";

const groupLabels: Record<VanityGroup, string> = {
  hydrators: "Hydration Products",
  tools: "My Makeup Tools",
  serums: "Serums & Treatments",
  creams: "Creams & Sunscreen"
};

const toolItems = [
  { title: "Kabuki Brush", subtitle: "Clean: 3d ago", status: "Safe" },
  { title: "Blending Sponge", subtitle: "Replace soon", status: "Check" },
  { title: "Eyeshadow Brush Set", subtitle: "Clean: 1w ago", status: "Safe" }
];

export default function VanityScreen() {
  const { state } = useAppState();
  const [selectedGroup, setSelectedGroup] = useState<VanityGroup | null>(null);
  const hasSavedProducts = state.products.length > 0;
  const products = hasSavedProducts ? state.products : [
    createDemoProduct("hydration", "vanity-demo"),
    createDemoProduct("barrier", "vanity-demo"),
    createDemoProduct("retinol", "vanity-demo"),
    createDemoProduct("sunscreen", "vanity-demo")
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>MY VANITY</Text>
          <Text style={styles.title}>Virtual Vanity Table</Text>
          <Text style={styles.subtitle}>Tap a product or the mirror to explore</Text>
        </View>

        <View style={styles.stage}>
          <Pressable accessibilityRole="button" accessibilityLabel="Open my routine" style={styles.mirror} onPress={() => router.push("/(tabs)/routine")}>
            <View style={styles.mirrorInner}>
              <Text style={styles.bunny}>v</Text>
            </View>
          </Pressable>

          <View style={styles.tabletop}>
            <Pressable accessibilityRole="button" accessibilityLabel="View hydration products" onPress={() => setSelectedGroup("hydrators")} style={styles.smallBottle} />
            <Pressable accessibilityRole="button" accessibilityLabel="View cream products" onPress={() => setSelectedGroup("creams")} style={styles.jar} />
            <Pressable accessibilityRole="button" accessibilityLabel="View makeup tools" onPress={() => setSelectedGroup("tools")} style={styles.brushCup}>
              <View style={styles.brush} />
              <View style={[styles.brush, styles.brushTwo]} />
              <View style={[styles.brush, styles.brushThree]} />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="View serums" onPress={() => setSelectedGroup("serums")} style={styles.dropperPair}>
              <View style={styles.dropper} />
              <View style={styles.dropper} />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="View treatment products" onPress={() => setSelectedGroup("serums")} style={styles.tubeGroup}>
              <View style={styles.bigTube} />
              <View style={[styles.bigTube, styles.bigTubeDark]} />
              <View style={styles.slimTube} />
            </Pressable>
          </View>
          <View style={styles.drawer}>
            <View style={styles.drawerLine} />
          </View>
        </View>
      </ScrollView>
      {selectedGroup ? <ProductSheet group={selectedGroup} products={products} canOpenProducts={hasSavedProducts} onClose={() => setSelectedGroup(null)} /> : null}
    </SafeAreaView>
  );
}

function ProductSheet({ group, products, canOpenProducts, onClose }: { group: VanityGroup; products: Product[]; canOpenProducts: boolean; onClose: () => void }) {
  const visibleProducts = getProductsForGroup(group, products);
  const isTools = group === "tools";

  return (
    <View style={styles.sheetBackdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.sheetHeader}>
          <View>
            <Text style={styles.sheetTitle}>{groupLabels[group]}</Text>
            <Text style={styles.sheetSubtitle}>{isTools ? `${toolItems.length} items in your vanity` : `${visibleProducts.length} products in your vanity`}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Close product list" style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>x</Text>
          </Pressable>
        </View>

        {isTools
          ? toolItems.map((item) => <SheetRow key={item.title} title={item.title} subtitle={item.subtitle} badge={item.status} warning={item.status === "Check"} />)
          : visibleProducts.map((product) => (
              <Pressable key={product.id} disabled={!canOpenProducts} onPress={() => router.push({ pathname: "/product/[id]", params: { id: product.id } })}>
                <SheetRow title={displayProductName(product)} subtitle={`${displayBrand(product)} · ${product.category}`} badge={product.analysis.avoidedMatches.length > 0 ? "Check" : "Safe"} warning={product.analysis.avoidedMatches.length > 0} />
              </Pressable>
            ))}

        {!isTools && visibleProducts.length === 0 ? <SheetRow title="No products yet" subtitle="Scan one to add it here." badge="Scan" warning /> : null}
      </View>
    </View>
  );
}

function SheetRow({ title, subtitle, badge, warning }: { title: string; subtitle: string; badge: string; warning?: boolean }) {
  return (
    <View style={styles.sheetRow}>
      <View style={styles.sheetRowCopy}>
        <Text style={styles.sheetRowTitle}>{title}</Text>
        <Text style={styles.sheetRowSubtitle}>{subtitle}</Text>
      </View>
      <View style={[styles.badge, warning && styles.badgeWarning]}>
        <Text style={[styles.badgeText, warning && styles.badgeWarningText]}>{badge}</Text>
      </View>
    </View>
  );
}

function getProductsForGroup(group: VanityGroup, products: Product[]): Product[] {
  if (group === "hydrators") {
    return products.filter((product) => product.benefits.includes("hydration") || product.benefits.includes("soothing"));
  }
  if (group === "serums") {
    return products.filter((product) => product.category === "serum" || product.category === "treatment" || product.category === "essence");
  }
  if (group === "creams") {
    return products.filter((product) => product.category === "moisturizer" || product.category === "sunscreen" || product.benefits.includes("barrier"));
  }
  return products;
}

function displayProductName(product: Product): string {
  const demoNames: Record<string, string> = {
    "수분 진정 세럼": "Hydrating Calming Serum",
    "장벽 크림": "Barrier Cream",
    "레티놀 세럼": "Retinol Serum",
    "데일리 선스크린": "Daily Sunscreen",
    "약산성 클렌저": "Low-pH Cleanser",
    "살리실릭 토너": "Salicylic Toner",
    "락틱 애씨드 패드": "Lactic Acid Pads"
  };
  return demoNames[product.name] ?? product.name;
}

function displayBrand(product: Product): string {
  const demoBrands: Record<string, string> = {
    "데모랩": "Demo Lab",
    "선데모": "Sun Demo",
    "클린데모": "Clean Demo",
    "포어데모": "Pore Demo",
    "글로우데모": "Glow Demo",
    "브랜드 미상": "Unknown Brand"
  };
  return demoBrands[product.brand] ?? product.brand;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FCF8F3"
  },
  content: {
    minHeight: "100%",
    paddingHorizontal: 30,
    paddingTop: 36,
    paddingBottom: 88
  },
  hero: {
    gap: 10,
    marginTop: 10
  },
  eyebrow: {
    color: "#B7AA9A",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 6
  },
  title: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.muted,
    fontSize: 17,
    lineHeight: 24
  },
  stage: {
    width: "100%",
    minHeight: 360,
    marginTop: 44,
    alignSelf: "center",
    justifyContent: "center"
  },
  mirror: {
    alignSelf: "center",
    width: 184,
    height: 288,
    borderTopLeftRadius: 92,
    borderTopRightRadius: 92,
    borderWidth: 7,
    borderColor: "#F4B86F",
    backgroundColor: "#FFF2CE",
    alignItems: "center",
    justifyContent: "center"
  },
  mirrorInner: {
    width: 69,
    height: 96,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    backgroundColor: "#E9BDB3",
    alignItems: "center",
    justifyContent: "center"
  },
  bunny: {
    color: "#FFF2CE",
    fontSize: 43,
    fontWeight: "900"
  },
  tabletop: {
    alignSelf: "center",
    width: "92%",
    height: 45,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: "#F7BD72",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 13,
    paddingBottom: 11,
    marginTop: -8
  },
  drawer: {
    alignSelf: "center",
    width: "92%",
    height: 58,
    backgroundColor: "#EFAF64",
    borderColor: "#D9944D",
    borderWidth: 2
  },
  drawerLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    width: 2,
    backgroundColor: "#D9944D"
  },
  smallBottle: {
    width: 19,
    height: 42,
    borderRadius: 4,
    backgroundColor: "#A7C177"
  },
  jar: {
    width: 34,
    height: 27,
    borderRadius: 12,
    backgroundColor: "#E9A91E"
  },
  brushCup: {
    width: 37,
    height: 34,
    borderRadius: 4,
    backgroundColor: "#7671C6"
  },
  brush: {
    position: "absolute",
    top: -14,
    left: 8,
    width: 6,
    height: 24,
    borderRadius: 4,
    backgroundColor: "#F29A91"
  },
  brushTwo: {
    left: 18,
    backgroundColor: "#E2798B"
  },
  brushThree: {
    left: 28,
    top: -6,
    height: 18
  },
  dropperPair: {
    flexDirection: "row",
    gap: 5
  },
  dropper: {
    width: 13,
    height: 40,
    borderRadius: 3,
    backgroundColor: "#DFAF84"
  },
  tubeGroup: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 5
  },
  bigTube: {
    width: 22,
    height: 58,
    borderRadius: 4,
    backgroundColor: "#B87652"
  },
  bigTubeDark: {
    width: 16,
    height: 50,
    backgroundColor: "#7D4B34"
  },
  slimTube: {
    width: 19,
    height: 46,
    borderRadius: 4,
    backgroundColor: "#E6B287"
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    backgroundColor: "rgba(43, 72, 71, 0.42)"
  },
  sheet: {
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    backgroundColor: "#FCF8F3",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 42,
    gap: 16
  },
  handle: {
    alignSelf: "center",
    width: 78,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#D6CFC4",
    marginBottom: 12
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 12
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 29,
    lineHeight: 36,
    fontWeight: "900"
  },
  sheetSubtitle: {
    color: colors.muted,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: "700",
    marginTop: 8
  },
  closeButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white"
  },
  closeText: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 28,
    fontWeight: "800"
  },
  sheetRow: {
    minHeight: 86,
    borderRadius: 24,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    paddingHorizontal: 22,
    paddingVertical: 18
  },
  sheetRowCopy: {
    flex: 1,
    gap: 8
  },
  sheetRowTitle: {
    color: colors.text,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "900"
  },
  sheetRowSubtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700"
  },
  badge: {
    borderRadius: 999,
    backgroundColor: "#EDF1EA",
    paddingHorizontal: 16,
    paddingVertical: 9
  },
  badgeWarning: {
    backgroundColor: "#FFF2EA"
  },
  badgeText: {
    color: "#6F966F",
    fontSize: 16,
    fontWeight: "900"
  },
  badgeWarningText: {
    color: colors.coral
  }
});
