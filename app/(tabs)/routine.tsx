import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../src/components/ui";

type Mode = "routine" | "feed";
type Period = "AM" | "PM";

export default function RoutineScreen() {
  const [mode, setMode] = useState<Mode>("routine");
  const [period, setPeriod] = useState<Period>("PM");
  const [resolutionOpen, setResolutionOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>EVENING · MON</Text>
            <Text style={styles.title}>{mode === "routine" ? "My Vanity Routine" : "My Vanity & Smart Feed"}</Text>
          </View>
          <Pressable style={styles.settings} onPress={() => setMode(mode === "routine" ? "feed" : "routine")}>
            <Text style={styles.settingsText}>⚙</Text>
          </Pressable>
        </View>

        <View style={styles.segmented}>
          <Pressable style={[styles.segment, period === "AM" && styles.segmentActive]} onPress={() => setPeriod("AM")}>
            <Text style={[styles.segmentText, period === "AM" && styles.segmentTextActive]}>☀ AM</Text>
          </Pressable>
          <Pressable style={[styles.segment, period === "PM" && styles.segmentActive]} onPress={() => setPeriod("PM")}>
            <Text style={[styles.segmentText, period === "PM" && styles.segmentTextActive]}>☾ PM</Text>
          </Pressable>
        </View>

        {mode === "routine" ? <RoutineContent period={period} onOpenResolution={() => setResolutionOpen(true)} /> : <SmartFeedContent period={period} />}
      </ScrollView>
      {resolutionOpen ? <ResolutionSheet onClose={() => setResolutionOpen(false)} onApply={() => { setPeriod("AM"); setResolutionOpen(false); }} /> : null}
    </SafeAreaView>
  );
}

function RoutineContent({ period, onOpenResolution }: { period: Period; onOpenResolution: () => void }) {
  const first = period === "AM" ? ["STEP 1: Gentle Cleanser", "60 sec", "#Cleanse"] : ["STEP 1: A-Serum", "2 drops", "#Vit_C"];
  const second = period === "AM" ? ["STEP 2: Daily Sunscreen", "2 fingers", "#SPF"] : ["STEP 2: B-Cream", "pea size", "#Retinol"];

  return (
    <>
      <View style={styles.timeline}>
        <View style={styles.timelineLine} />
        <RoutineStep number="01" title={first[0]} amount={first[1]} tag={first[2]} />
        {period === "PM" ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Open AI conflict resolution" style={styles.warning} onPress={onOpenResolution}>
            <Text style={styles.warningText}>⚠ Conflict Detected! (Vitamin C + Retinol)</Text>
          </Pressable>
        ) : null}
        <RoutineStep number="02" title={second[0]} amount={second[1]} tag={second[2]} />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>AI Personal Recommendations</Text>
        <Text style={styles.sectionSubtitle}>Saved safe alternatives for your routine</Text>
      </View>
      <Recommendation match="98% Match" title="C-Ampoule" subtitle="15% L-ascorbic acid · Brightening" />
      <Recommendation match="96% Match" title="Barrier Recovery Cream" subtitle="Ceramide-rich · Deep hydration" />
    </>
  );
}

function ResolutionSheet({ onClose, onApply }: { onClose: () => void; onApply: () => void }) {
  return (
    <View style={styles.sheetBackdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={styles.resolutionSheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.resolutionKickerRow}>
          <Text style={styles.resolutionKicker}>AI RESOLUTION</Text>
          <View style={styles.resolutionLine} />
        </View>
        <Text style={styles.resolutionTitle}>Solution! Split: AM / PM.</Text>
        <Text style={styles.resolutionAccent}>Move Vitamin C to Morning.</Text>
        <Text style={styles.resolutionBody}>
          Separating these actives reduces irritation and preserves potency. Apply A-Serum in your AM routine, keep B-Cream in PM.
        </Text>
        <View style={styles.resolutionActions}>
          <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={onClose}>
            <Text style={styles.secondaryButtonText}>Adjust Cycle</Text>
          </Pressable>
          <Pressable accessibilityRole="button" style={styles.primaryButton} onPress={onApply}>
            <Text style={styles.primaryButtonText}>Apply AM/PM Split</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function SmartFeedContent({ period }: { period: Period }) {
  return (
    <>
      <View style={styles.feedSteps}>
        <MiniStep number="01" title={period === "AM" ? "Cleanser" : "A-Serum"} subtitle={period === "AM" ? "Gentle cleanse" : "Vitamin C"} tag={period === "AM" ? "#Cleanse" : "#Vit_C"} />
        <MiniStep number="02" title={period === "AM" ? "Sunscreen" : "B-Cream"} subtitle={period === "AM" ? "SPF" : "Retinol"} tag={period === "AM" ? "#SPF" : "#Retinol"} />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🔔 AI Smart Feed</Text>
        <Text style={styles.sectionSubtitle}>Personalized alerts & discoveries for your skin</Text>
      </View>
      <FeedCard title="✨ NEW Product Match" badge="97% Match" body="A newly released ultra-gentle hydrating serum specifically formulated for dry skin. Contains 5 Ceramides and Hyaluronic Acid complex." />
      <FeedCard title="🔄 Warning: Formula Renewal" badge="Score Dropped: 92% to 45% 🔴" body="Your saved toner 'Aqua Balance Toner' has added Ethanol in its new renewal formula. We recommend reviewing compatibility." danger />
    </>
  );
}

function RoutineStep({ number, title, amount, tag }: { number: string; title: string; amount: string; tag: string }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepDot}><Text style={styles.stepDotText}>{number}</Text></View>
      <View style={styles.stepCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.stepTitle}>{title}</Text>
          <Text style={styles.amount}>{amount}</Text>
        </View>
        <Text style={styles.tag}>{tag}</Text>
      </View>
    </View>
  );
}

function MiniStep({ number, title, subtitle, tag }: { number: string; title: string; subtitle: string; tag: string }) {
  return (
    <View style={styles.miniStep}>
      <View style={styles.miniDot}><Text style={styles.stepDotText}>{number}</Text></View>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.amount}>{subtitle}</Text>
      <Text style={styles.tag}>{tag}</Text>
    </View>
  );
}

function Recommendation({ match, title, subtitle }: { match: string; title: string; subtitle: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.match}>{match}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
      <View style={styles.actions}>
        <Text style={styles.actionMuted}>Buy Now 🛒</Text>
        <Text style={styles.actionGreen}>Add to Routine +</Text>
      </View>
    </View>
  );
}

function FeedCard({ title, badge, body, danger }: { title: string; badge: string; body: string; danger?: boolean }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={[styles.badge, danger && styles.badgeDanger]}>{badge}</Text>
      <Text style={styles.feedBody}>{body}</Text>
      <View style={styles.actions}>
        <Text style={styles.actionMuted}>View Analysis</Text>
        <Text style={styles.actionGreen}>Find Alternatives</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FCF8F3" },
  content: { paddingHorizontal: 26, paddingTop: 86, paddingBottom: 120 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { color: "#B7AA9A", fontSize: 14, fontWeight: "900", letterSpacing: 6 },
  title: { color: colors.text, fontSize: 32, lineHeight: 39, fontWeight: "900", marginTop: 16 },
  settings: { width: 58, height: 58, borderRadius: 29, backgroundColor: "white", alignItems: "center", justifyContent: "center", shadowColor: "#4A443A", shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } },
  settingsText: { color: colors.text, fontSize: 24 },
  segmented: { flexDirection: "row", padding: 7, borderRadius: 40, backgroundColor: "#E9E3D7", marginTop: 44, marginBottom: 34 },
  segment: { flex: 1, borderRadius: 32, alignItems: "center", paddingVertical: 18 },
  segmentActive: { backgroundColor: "#6F966F", shadowColor: "#6F966F", shadowOpacity: 0.22, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
  segmentText: { color: "#8F8375", fontSize: 17, fontWeight: "900" },
  segmentTextActive: { color: "white" },
  timeline: { position: "relative" },
  timelineLine: { position: "absolute", left: 34, top: 30, bottom: 36, width: 1, backgroundColor: "#E6DED0" },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 18, marginBottom: 18 },
  stepDot: { width: 56, height: 56, borderRadius: 28, backgroundColor: "white", alignItems: "center", justifyContent: "center", shadowColor: "#4A443A", shadowOpacity: 0.10, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
  stepDotText: { color: "#6F966F", fontSize: 15, fontWeight: "900" },
  stepCard: { flex: 1, minHeight: 102, borderRadius: 24, backgroundColor: "white", padding: 22, shadowColor: "#4A443A", shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  stepTitle: { color: colors.text, fontSize: 20, fontWeight: "900" },
  amount: { color: colors.muted, fontSize: 15, lineHeight: 24 },
  tag: { alignSelf: "flex-start", marginTop: 12, borderRadius: 999, backgroundColor: "#EDF1EA", color: "#6F966F", paddingHorizontal: 10, paddingVertical: 5, fontSize: 13, fontWeight: "900" },
  warning: { marginLeft: 74, borderRadius: 18, borderWidth: 1, borderStyle: "dashed", borderColor: "#F2CDBD", backgroundColor: "#FFF7F0", padding: 18, marginBottom: 18 },
  warningText: { color: colors.coral, fontSize: 15, fontWeight: "900" },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end", backgroundColor: "rgba(43, 72, 71, 0.32)" },
  resolutionSheet: { borderTopLeftRadius: 34, borderTopRightRadius: 34, backgroundColor: "white", paddingHorizontal: 28, paddingTop: 26, paddingBottom: 42, shadowColor: "#000", shadowOpacity: 0.14, shadowRadius: 24, shadowOffset: { width: 0, height: -8 } },
  sheetHandle: { alignSelf: "center", width: 78, height: 7, borderRadius: 999, backgroundColor: "#DED8CC", marginBottom: 34 },
  resolutionKickerRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 26 },
  resolutionKicker: { color: "#6F966F", fontSize: 13, fontWeight: "900", letterSpacing: 6 },
  resolutionLine: { flex: 1, height: 1, backgroundColor: "#DED8CC" },
  resolutionTitle: { color: colors.text, fontSize: 27, lineHeight: 34, fontWeight: "900" },
  resolutionAccent: { color: colors.coral, fontSize: 22, lineHeight: 30, fontWeight: "900", marginTop: 16 },
  resolutionBody: { color: colors.muted, fontSize: 19, lineHeight: 31, fontWeight: "700", marginTop: 20 },
  resolutionActions: { flexDirection: "row", gap: 16, marginTop: 36 },
  secondaryButton: { flex: 1, minHeight: 76, borderRadius: 24, borderWidth: 2, borderColor: "#E7E0D5", alignItems: "center", justifyContent: "center", backgroundColor: "white" },
  secondaryButtonText: { color: colors.text, fontSize: 18, fontWeight: "900" },
  primaryButton: { flex: 1, minHeight: 76, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: "#6F966F", shadowColor: "#6F966F", shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  primaryButtonText: { color: "white", fontSize: 18, fontWeight: "900", textAlign: "center" },
  sectionHeader: { marginTop: 34, marginBottom: 18 },
  sectionTitle: { color: colors.text, fontSize: 23, fontWeight: "900" },
  sectionSubtitle: { color: colors.muted, fontSize: 16, fontWeight: "800", marginTop: 12 },
  card: { borderRadius: 26, backgroundColor: "white", padding: 24, marginBottom: 20, shadowColor: "#4A443A", shadowOpacity: 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 12 } },
  match: { color: "#6F966F", fontSize: 16, fontWeight: "900", letterSpacing: 2 },
  cardTitle: { color: colors.text, fontSize: 21, fontWeight: "900", marginTop: 10 },
  cardSubtitle: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: 8 },
  actions: { flexDirection: "row", gap: 28, marginTop: 24 },
  actionMuted: { color: colors.muted, fontSize: 16, fontWeight: "900" },
  actionGreen: { color: "#6F966F", fontSize: 16, fontWeight: "900" },
  feedSteps: { flexDirection: "row", gap: 18 },
  miniStep: { flex: 1, borderRadius: 22, backgroundColor: "white", padding: 20, shadowColor: "#4A443A", shadowOpacity: 0.07, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } },
  miniDot: { width: 38, height: 38, borderRadius: 19, backgroundColor: "white", alignItems: "center", justifyContent: "center", shadowColor: "#4A443A", shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, marginBottom: 10 },
  badge: { alignSelf: "flex-start", color: "#6F966F", backgroundColor: "#EDF1EA", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, marginTop: 18, fontSize: 15, fontWeight: "900" },
  badgeDanger: { color: colors.coral, backgroundColor: "#FFF0E8" },
  feedBody: { color: colors.muted, fontSize: 17, lineHeight: 28, marginTop: 24 }
});
