import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { AnalyzerExtraction } from "../domain/types";
import { getConfiguredAnalyzer, remoteAnalyzerErrorMessage } from "../services/analyzer/ProductAnalyzer";
import { prepareAnalyzerImage } from "../services/analyzer/imagePreprocessing";
import { colors } from "./ui";

const screens = [
  "PROFILE",
  "SKIN TYPE",
  "PROCESSING",
  "REPORT"
] as const;

type FlowScreen = (typeof screens)[number];
type RoutinePeriod = "AM" | "PM";
type ScanMode = "front" | "ingredients";

export function LovableFlow() {
  const [index, setIndex] = useState(0);
  const [gender, setGender] = useState("Female");
  const [ageGroup, setAgeGroup] = useState("20s");
  const [skinType, setSkinType] = useState("Dry");
  const [concerns, setConcerns] = useState<string[]>(["#Hydration", "#Redness"]);
  const [selectedRecommendation, setSelectedRecommendation] = useState("A-Cream");
  const [scanLocked, setScanLocked] = useState(false);
  const [productAdded, setProductAdded] = useState(false);
  const [vanityCategory, setVanityCategory] = useState("Creams");
  const [routinePeriod, setRoutinePeriod] = useState<RoutinePeriod>("PM");
  const [savedRecommendations, setSavedRecommendations] = useState<string[]>([]);
  const [feedActions, setFeedActions] = useState<string[]>([]);
  const [diagnosticsReady, setDiagnosticsReady] = useState(false);
  const [scanMode, setScanMode] = useState<ScanMode | null>(null);
  const [scanImageUri, setScanImageUri] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<AnalyzerExtraction | null>(null);
  const [scanBusy, setScanBusy] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const current = screens[index] ?? "PROFILE";
  const progress = useMemo(() => `STEP ${String(index + 1).padStart(2, "0")} / 04`, [index]);

  useEffect(() => {
    if (current !== "PROCESSING" || diagnosticsReady) {
      return;
    }
    const timer = setTimeout(() => {
      setDiagnosticsReady(true);
    }, 1700);
    return () => clearTimeout(timer);
  }, [current, diagnosticsReady]);

  function toggleConcern(concern: string) {
    setConcerns((currentConcerns) => (currentConcerns.includes(concern) ? currentConcerns.filter((item) => item !== concern) : [...currentConcerns, concern]));
  }

  function toggleSavedRecommendation(name: string) {
    setSavedRecommendations((saved) => (saved.includes(name) ? saved.filter((item) => item !== name) : [...saved, name]));
  }

  function toggleFeedAction(action: string) {
    setFeedActions((actions) => (actions.includes(action) ? actions.filter((item) => item !== action) : [...actions, action]));
  }

  function next() {
    if (current === "PROCESSING" && !diagnosticsReady) {
      return;
    }
    if (index < screens.length - 1) {
      setIndex(index + 1);
      return;
    }
    router.replace("/(tabs)/vanity");
  }

  function back() {
    setIndex(Math.max(0, index - 1));
  }

  async function runScan(mode: ScanMode) {
    setScanMode(mode);
    setScanBusy(true);
    setScanError(null);
    setScanResult(null);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        throw new Error("Camera permission is required to scan a product.");
      }
      const picked = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.72,
        mediaTypes: ImagePicker.MediaTypeOptions.Images
      });
      if (picked.canceled) {
        return;
      }
      const uri = picked.assets[0]?.uri;
      if (!uri) {
        throw new Error("No image was captured.");
      }
      setScanImageUri(uri);
      const image = await prepareAnalyzerImage(uri, mode);
      const extraction = await getConfiguredAnalyzer().extractProductImages({
        frontImage: mode === "front" ? image : undefined,
        ingredientsImage: mode === "ingredients" ? image : undefined
      });
      setScanResult(extraction);
      setScanLocked(true);
    } catch (error) {
      setScanError(remoteAnalyzerErrorMessage(error));
    } finally {
      setScanBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Pressable style={[styles.roundButton, index === 0 && styles.hidden]} onPress={back}>
            <Text style={styles.roundButtonText}>‹</Text>
          </Pressable>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>{progress}</Text>
          </View>
          <Pressable style={styles.roundButton} onPress={() => router.replace("/(tabs)/scan")}>
            <Text style={styles.roundButtonText}>↗</Text>
          </Pressable>
        </View>

        {current === "PROFILE" ? <ProfilePage gender={gender} ageGroup={ageGroup} onGenderChange={setGender} onAgeGroupChange={setAgeGroup} /> : null}
        {current === "SKIN TYPE" ? <SkinTypePage skinType={skinType} concerns={concerns} onSkinTypeChange={setSkinType} onConcernToggle={toggleConcern} /> : null}
        {current === "PROCESSING" ? <ProcessingPage ready={diagnosticsReady} skinType={skinType} concerns={concerns} /> : null}
        {current === "REPORT" ? <ReportPage selectedRecommendation={selectedRecommendation} onSelectRecommendation={setSelectedRecommendation} /> : null}
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton title={footerTitle(current, diagnosticsReady)} disabled={current === "PROCESSING" && !diagnosticsReady} onPress={next} />
      </View>
    </SafeAreaView>
  );
}

function ProfilePage({
  gender,
  ageGroup,
  onGenderChange,
  onAgeGroupChange
}: {
  gender: string;
  ageGroup: string;
  onGenderChange: (value: string) => void;
  onAgeGroupChange: (value: string) => void;
}) {
  return (
    <View style={styles.whitePanel}>
      <View style={styles.brandRow}>
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>v</Text>
        </View>
        <View>
          <Text style={styles.panelTitle}>Welcome to Vanny!</Text>
          <Text style={styles.panelCopy}>Let's set up your virtual vanity table.</Text>
        </View>
      </View>
      <Field label="YOUR NAME" placeholder="What should we call you?" />
      <Segment label="GENDER" values={["Female", "Male", "Neutral"]} active={gender} onChange={onGenderChange} />
      <Segment label="AGE GROUP" values={["Teens", "20s", "30s", "40s+"]} active={ageGroup} onChange={onAgeGroupChange} wrap />
    </View>
  );
}

function SkinTypePage({
  skinType,
  concerns,
  onSkinTypeChange,
  onConcernToggle
}: {
  skinType: string;
  concerns: string[];
  onSkinTypeChange: (value: string) => void;
  onConcernToggle: (value: string) => void;
}) {
  return (
    <View>
      <ProgressHeader step="STEP 02 / 04" percent="50%" />
      <Hero title={"Select Your\nSkin Type."} subtitle="We calibrate analysis to your baseline biology." />
      <Choice title="Dry" subtitle="Feels tight after washing" selected={skinType === "Dry"} onPress={() => onSkinTypeChange("Dry")} />
      <Choice title="Oily" subtitle="Shine returns within hours" selected={skinType === "Oily"} onPress={() => onSkinTypeChange("Oily")} />
      <Choice title="Combination" subtitle="Oily T-zone, dry cheeks" selected={skinType === "Combination"} onPress={() => onSkinTypeChange("Combination")} />
      <Text style={styles.kicker}>PICK YOUR CONCERNS</Text>
      <View style={styles.chipWrap}>
        {["#Hydration", "#Acne", "#Redness", "#Pores"].map((concern) => (
          <Chip key={concern} label={concern} active={concerns.includes(concern)} onPress={() => onConcernToggle(concern)} />
        ))}
      </View>
    </View>
  );
}

function ProcessingPage({ ready, skinType, concerns }: { ready: boolean; skinType: string; concerns: string[] }) {
  const steps = ready
    ? ["Profile parsed", "Skin profile matched", "Concern map generated", "Report ready"]
    : ["Analyzing profile...", "Matching skin profile...", "Screening concerns...", "Scoring..."];
  return (
    <View style={styles.centerPage}>
      {ready ? <Text style={styles.readyMark}>✓</Text> : <ActivityIndicator size="large" color={colors.sage} />}
      <Text style={styles.kicker}>DERMA.AI · v2.4</Text>
      <Text style={styles.panelTitle}>{ready ? "Diagnostics complete" : "Running diagnostics"}</Text>
      <Text style={styles.panelCopy}>AI profile pass for {skinType} skin · {concerns.join(", ") || "no concerns selected"}</Text>
      {steps.map((step, idx) => (
        <View key={step} style={styles.processRow}>
          <Text style={[styles.processText, (ready || idx === 2) && styles.processActive]}>{idx + 1}. {step}</Text>
          <Text style={[styles.processText, (ready || idx === 2) && styles.processActive]}>{ready || idx < 2 ? "✓ OK" : idx === 2 ? "···" : ""}</Text>
        </View>
      ))}
      <Text style={styles.microCopy}>{ready ? "CONTINUE ENABLED" : "WAITING FOR AI RESPONSE"}</Text>
    </View>
  );
}

function ReportPage({ selectedRecommendation, onSelectRecommendation }: { selectedRecommendation: string; onSelectRecommendation: (value: string) => void }) {
  return (
    <View>
      <Text style={styles.kicker}>REPORT · 06.20.26</Text>
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.greenKicker}>DIAGNOSIS</Text>
          <Chip label="CONFIDENCE 96%" active small />
        </View>
        <Text style={styles.bigTitle}>Dry & Dehydrated{"\n"}Skin.</Text>
        <View style={styles.metricRow}>
          <MiniMetric value="32%" label="Moisture" />
          <MiniMetric value="71%" label="Barrier" />
          <MiniMetric value="Low" label="Sebum" />
        </View>
      </View>
      <Section label="INGREDIENT MATRIX" />
      <Text style={styles.sectionTitle}>Good for you</Text>
      <View style={styles.chipWrap}>
        <Chip label="Ceramides" active />
        <Chip label="Hyaluronic Acid" active />
      </View>
      <Text style={[styles.sectionTitle, styles.avoidTitle]}>Avoid</Text>
      <Chip label="Ethanol" danger />
      <Section label="RECOMMENDED FOR YOU" />
      <View style={styles.horizontalCards}>
        {["A-Cream", "H-Serum", "C-Mask"].map((name, idx) => (
          <ProductMini
            key={name}
            name={name}
            sub={["Barrier Repair", "Deep Hydrate", "Overnight"][idx] ?? ""}
            match={96 - idx * 4}
            selected={selectedRecommendation === name}
            onPress={() => onSelectRecommendation(name)}
          />
        ))}
      </View>
    </View>
  );
}

function ScannerPage({
  scanLocked,
  scanMode,
  imageUri,
  result,
  busy,
  error,
  onScan
}: {
  scanLocked: boolean;
  scanMode: ScanMode | null;
  imageUri: string | null;
  result: AnalyzerExtraction | null;
  busy: boolean;
  error: string | null;
  onScan: (mode: ScanMode) => void;
}) {
  return (
    <View>
      <Hero title="What would you like to scan?" subtitle="Choose product front for identity, or ingredient list for full analysis." eyebrow="OCR SCANNER" />
      <ScanChoice title="Product Front" subtitle="Scan the brand name or product label." active={scanMode === "front"} onPress={() => onScan("front")} />
      <ScanChoice title="Ingredient List" subtitle="Scan the back of the packaging to analyze the full ingredient list." active={scanMode === "ingredients"} onPress={() => onScan("ingredients")} />
      <View style={styles.cameraFrame}>
        {imageUri ? <Image source={{ uri: imageUri }} style={styles.scannedImage} /> : (
          <View style={styles.fakeLabel}>
            <Text style={styles.fakeLabelTitle}>INGREDIENTS</Text>
            <Text style={styles.fakeLabelText}>Tap a scan option above to open the camera.</Text>
          </View>
        )}
        <View style={[styles.scanBox, scanLocked && styles.scanBoxLocked]}>
          <View style={styles.scanLine} />
        </View>
        {busy ? <ActivityIndicator color="white" /> : null}
        <Text style={styles.cameraCaption}>{busy ? "Analyzing with AI..." : result ? "Scan complete · result ready" : "Camera scan required"}</Text>
      </View>
      {result ? (
        <View style={styles.card}>
          <Text style={styles.panelTitle}>{result.productName || "Scanned product"}</Text>
          <Text style={styles.panelCopy}>{result.brand || "Brand unknown"} · {result.ingredients.length} ingredients detected</Text>
        </View>
      ) : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function MatchPage({ skinType, productAdded, result, onToggleProductAdded }: { skinType: string; productAdded: boolean; result: AnalyzerExtraction | null; onToggleProductAdded: () => void }) {
  const goodIngredient = result?.ingredients[0] ?? "Glycerin";
  const cautionIngredient = result?.ingredients.find((ingredient) => /alcohol|ethanol|fragrance|parfum/i.test(ingredient)) ?? "Stearic Acid";
  return (
    <View>
      <Text style={styles.kickerCenter}>RESULT</Text>
      <View style={styles.gauge}>
        <Text style={styles.gaugeLabel}>SAFETY SCORE</Text>
        <Text style={styles.gaugeValue}>85<Text style={styles.gaugePercent}>%</Text></Text>
        <Text style={styles.greenKicker}>RECOMMENDED</Text>
      </View>
      <Text style={styles.centerStatement}>This product is 85% safe{"\n"}for your <Text style={styles.greenText}>{skinType}</Text> skin.</Text>
      <Section label="GOOD INGREDIENTS" />
      <IngredientRow title={goodIngredient} subtitle="Detected from your scan" badge="+MATCH" />
      <Section label="BAD INGREDIENTS" />
      <IngredientRow title={cautionIngredient} subtitle="Review compatibility for your profile" badge="-CHECK" danger />
      <Pressable style={[styles.inlineAction, productAdded && styles.inlineActionSelected]} onPress={onToggleProductAdded}>
        <Text style={[styles.inlineActionText, productAdded && styles.inlineActionTextSelected]}>{productAdded ? "Added to My Vanity ✓" : "Add to My Vanity +"}</Text>
      </Pressable>
    </View>
  );
}

function VanityPage({
  activeCategory,
  productAdded,
  result,
  onCategoryChange
}: {
  activeCategory: string;
  productAdded: boolean;
  result: AnalyzerExtraction | null;
  onCategoryChange: (value: string) => void;
}) {
  const categories = ["Creams", "Toners", "Lotions", "Tools"];
  return (
    <View>
      <Hero title="Virtual Vanity Table" subtitle="Tap an item to view your products." eyebrow="MY VANITY" />
      <View style={styles.vanityStage}>
        <View style={styles.mirror} />
        <View style={styles.table}>
          <Bottle wide active={activeCategory === "Creams"} onPress={() => onCategoryChange("Creams")} />
          <Bottle tall active={activeCategory === "Toners"} onPress={() => onCategoryChange("Toners")} />
          <Bottle active={activeCategory === "Lotions"} onPress={() => onCategoryChange("Lotions")} />
          <Pressable style={[styles.toolCup, activeCategory === "Tools" && styles.vanityItemActive]} onPress={() => onCategoryChange("Tools")} />
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.panelTitle}>My {activeCategory}</Text>
        {productAdded ? <IngredientRow title={result?.productName || "Scanned Product"} subtitle={result?.brand || "Added from scanner"} badge="New" /> : null}
        {categories.includes(activeCategory) ? (
          <>
            <IngredientRow title={activeCategory === "Tools" ? "Kabuki Brush" : `Barrier ${activeCategory.slice(0, -1)}`} subtitle={activeCategory === "Tools" ? "Clean: 3d ago" : "4 mo left"} badge="Safe" />
            <IngredientRow title={activeCategory === "Tools" ? "Blending Sponge" : `Night Repair ${activeCategory.slice(0, -1)}`} subtitle={activeCategory === "Tools" ? "Replace soon" : "2 mo left"} badge="Check" danger />
          </>
        ) : null}
      </View>
    </View>
  );
}

function RoutinePage({
  period,
  onPeriodChange,
  savedRecommendations,
  onToggleRecommendation
}: {
  period: RoutinePeriod;
  onPeriodChange: (value: RoutinePeriod) => void;
  savedRecommendations: string[];
  onToggleRecommendation: (value: string) => void;
}) {
  const firstStep = period === "AM" ? { title: "STEP 1: Gentle Cleanser", meta: "60 sec", tag: "#Cleanse" } : { title: "STEP 1: A-Serum", meta: "2 drops", tag: "#Vit_C" };
  const secondStep = period === "AM" ? { title: "STEP 2: Daily Sunscreen", meta: "2 fingers", tag: "#SPF" } : { title: "STEP 2: B-Cream", meta: "pea size", tag: "#Retinol" };
  return (
    <View>
      <Hero title="My Vanity Routine" subtitle={`${period === "AM" ? "Morning" : "Evening"} · Mon`} eyebrow={`${period === "AM" ? "MORNING" : "EVENING"} · MON`} />
      <PeriodToggle value={period} onChange={onPeriodChange} />
      <TimelineStep number="01" title={firstStep.title} meta={firstStep.meta} tag={firstStep.tag} />
      {period === "PM" ? <View style={styles.warningStrip}><Text style={styles.warningStripText}>⚠ Conflict Detected! (Vitamin C + Retinol)</Text></View> : null}
      <TimelineStep number="02" title={secondStep.title} meta={secondStep.meta} tag={secondStep.tag} />
      <Section label="AI PERSONAL RECOMMENDATIONS" />
      <Recommendation name="C-Ampoule" sub="15% L-ascorbic acid · Brightening" match={98} saved={savedRecommendations.includes("C-Ampoule")} onToggle={() => onToggleRecommendation("C-Ampoule")} />
      <Recommendation
        name="Barrier Recovery Cream"
        sub="Ceramide-rich · Deep hydration"
        match={96}
        saved={savedRecommendations.includes("Barrier Recovery Cream")}
        onToggle={() => onToggleRecommendation("Barrier Recovery Cream")}
      />
    </View>
  );
}

function SmartFeedPage({
  period,
  onPeriodChange,
  feedActions,
  onToggleAction
}: {
  period: RoutinePeriod;
  onPeriodChange: (value: RoutinePeriod) => void;
  feedActions: string[];
  onToggleAction: (value: string) => void;
}) {
  return (
    <View>
      <Hero title="My Vanity & Smart Feed" subtitle="Personalized alerts & discoveries for your skin." eyebrow="EVENING · MON" />
      <PeriodToggle value={period} onChange={onPeriodChange} />
      <Section label="AI SMART FEED" />
      <FeedCard
        title="✨ NEW Product Match"
        badge="97% Match"
        desc="A newly released ultra-gentle hydrating serum formulated for dry skin."
        selected={feedActions.includes("new-match")}
        onToggle={() => onToggleAction("new-match")}
      />
      <FeedCard
        title="🔄 Warning: Formula Renewal"
        badge="Score Dropped: 92% to 45%"
        desc="Your saved toner has added Ethanol in its new formula. Review compatibility."
        selected={feedActions.includes("formula-renewal")}
        onToggle={() => onToggleAction("formula-renewal")}
        danger
      />
    </View>
  );
}

function RecommendedPage({
  savedRecommendations,
  onToggleRecommendation
}: {
  savedRecommendations: string[];
  onToggleRecommendation: (value: string) => void;
}) {
  return (
    <View>
      <Text style={styles.kickerCenter}>RECOMMENDED</Text>
      <Hero title="AI Recommendation" subtitle="Safe alternatives for your Dry skin and #Hydration concerns." />
      <Recommendation name="C-Ampoule" sub="Ultra-concentrated Vitamin C with 15% L-ascorbic acid." match={98} saved={savedRecommendations.includes("C-Ampoule")} onToggle={() => onToggleRecommendation("C-Ampoule")} />
      <Recommendation
        name="Barrier Recovery Cream"
        sub="Ceramide-rich moisturizer with squalane and panthenol."
        match={96}
        saved={savedRecommendations.includes("Barrier Recovery Cream")}
        onToggle={() => onToggleRecommendation("Barrier Recovery Cream")}
      />
    </View>
  );
}

function footerTitle(current: FlowScreen, diagnosticsReady: boolean): string {
  switch (current) {
    case "PROFILE":
      return "Let's Begin";
    case "SKIN TYPE":
      return "Analyze Skin in 3 Seconds →";
    case "PROCESSING":
      return diagnosticsReady ? "Continue →" : "Running diagnostics...";
    case "REPORT":
      return "Go to My Vanity";
    default:
      return "Continue →";
  }
}

function Hero({ title, subtitle, eyebrow }: { title: string; subtitle: string; eyebrow?: string }) {
  return (
    <View style={styles.heroBlock}>
      {eyebrow ? <Text style={styles.kicker}>{eyebrow}</Text> : null}
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroSubtitle}>{subtitle}</Text>
    </View>
  );
}

function PrimaryButton({ title, disabled, onPress }: { title: string; disabled?: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.primaryButton, disabled && styles.primaryButtonDisabled]} disabled={disabled} onPress={onPress}>
      <Text style={styles.primaryButtonText}>{title}</Text>
    </Pressable>
  );
}

function ScanChoice({ title, subtitle, active, onPress }: { title: string; subtitle: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.scanChoice, active && styles.scanChoiceActive]} onPress={onPress}>
      <View style={styles.scanIcon}>
        <Text style={styles.scanIconText}>{title === "Product Front" ? "▣" : "☷"}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.choiceTitle}>{title}</Text>
        <Text style={styles.choiceSubtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholder={placeholder} placeholderTextColor={colors.mutedSoft} />
    </View>
  );
}

function Segment({
  label,
  values,
  active,
  onChange,
  wrap
}: {
  label: string;
  values: string[];
  active: string;
  onChange: (value: string) => void;
  wrap?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.segmentRow, wrap && styles.segmentWrap]}>
        {values.map((value) => (
          <Pressable key={value} style={[styles.segmentChoice, value === active && styles.segmentChoiceActive]} onPress={() => onChange(value)}>
            <Text style={[styles.segmentChoiceText, value === active && styles.segmentChoiceTextActive]}>{value}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function ProgressHeader({ step, percent }: { step: string; percent: string }) {
  return (
    <View style={styles.progressWrap}>
      <View style={styles.rowBetween}>
        <Text style={styles.progressText}>{step}</Text>
        <Text style={styles.greenKicker}>{percent}</Text>
      </View>
      <View style={styles.progressTrack}><View style={styles.progressFill} /></View>
    </View>
  );
}

function Choice({ title, subtitle, selected, onPress }: { title: string; subtitle: string; selected?: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.choice, selected && styles.choiceSelected]} onPress={onPress}>
      <View>
        <Text style={styles.choiceTitle}>{title}</Text>
        <Text style={styles.choiceSubtitle}>{subtitle}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <Text style={styles.check}>✓</Text> : null}</View>
    </Pressable>
  );
}

function Chip({ label, active, danger, small, onPress }: { label: string; active?: boolean; danger?: boolean; small?: boolean; onPress?: () => void }) {
  const content = (
    <>
      <Text style={[styles.chipText, active && styles.chipTextActive, danger && styles.chipTextDanger]}>{label}</Text>
    </>
  );
  const chipStyle = [styles.chip, active && styles.chipActive, danger && styles.chipDanger, small && styles.chipSmall];
  if (onPress) {
    return (
      <Pressable style={chipStyle} onPress={onPress}>
        {content}
      </Pressable>
    );
  }
  return <View style={chipStyle}>{content}</View>;
}

function Section({ label }: { label: string }) {
  return <Text style={styles.kicker}>{label}</Text>;
}

function MiniMetric({ value, label }: { value: string; label: string }) {
  return (
    <View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function ProductMini({ name, sub, match, selected, onPress }: { name: string; sub: string; match: number; selected: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.productMini, selected && styles.productMiniSelected]} onPress={onPress}>
      <View style={styles.productIcon}><Bottle /></View>
      <Text style={styles.productName}>{name}</Text>
      <Text style={styles.productSub}>{sub}</Text>
      <Text style={styles.greenKicker}>{selected ? "SELECTED" : `AI MATCH: ${match}%`}</Text>
    </Pressable>
  );
}

function IngredientRow({ title, subtitle, badge, danger }: { title: string; subtitle: string; badge: string; danger?: boolean }) {
  return (
    <View style={[styles.ingredientRow, danger && styles.ingredientDanger]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.ingredientTitle}>{title}</Text>
        <Text style={styles.ingredientSub}>{subtitle}</Text>
      </View>
      <Text style={[styles.rowBadge, danger && styles.rowBadgeDanger]}>{badge}</Text>
    </View>
  );
}

function TimelineStep({ number, title, meta, tag }: { number: string; title: string; meta: string; tag: string }) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineDot}><Text style={styles.timelineDotText}>{number}</Text></View>
      <View style={styles.timelineCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.ingredientTitle}>{title}</Text>
          <Text style={styles.productSub}>{meta}</Text>
        </View>
        <Chip label={tag} active small />
      </View>
    </View>
  );
}

function PeriodToggle({ value, onChange }: { value: RoutinePeriod; onChange: (value: RoutinePeriod) => void }) {
  return (
    <View style={styles.segmented}>
      <Pressable style={[styles.periodOption, value === "AM" && styles.periodOptionActive]} onPress={() => onChange("AM")}>
        <Text style={[styles.periodOptionText, value === "AM" && styles.periodOptionTextActive]}>☀ AM</Text>
      </Pressable>
      <Pressable style={[styles.periodOption, value === "PM" && styles.periodOptionActive]} onPress={() => onChange("PM")}>
        <Text style={[styles.periodOptionText, value === "PM" && styles.periodOptionTextActive]}>☾ PM</Text>
      </Pressable>
    </View>
  );
}

function Recommendation({ name, sub, match, saved, onToggle }: { name: string; sub: string; match: number; saved: boolean; onToggle: () => void }) {
  return (
    <Pressable style={[styles.card, saved && styles.cardSelected]} onPress={onToggle}>
      <Chip label={`${match}% Match`} active small />
      <Text style={styles.panelTitle}>{name}</Text>
      <Text style={styles.panelCopy}>{sub}</Text>
      <View style={styles.actionRow}>
        <Text style={styles.linkMuted}>View Details</Text>
        <Text style={styles.linkGreen}>{saved ? "Added ✓" : "Add to Vanity +"}</Text>
      </View>
    </Pressable>
  );
}

function FeedCard({ title, badge, desc, selected, onToggle, danger }: { title: string; badge: string; desc: string; selected: boolean; onToggle: () => void; danger?: boolean }) {
  return (
    <Pressable style={[styles.card, selected && styles.cardSelected]} onPress={onToggle}>
      <Text style={styles.ingredientTitle}>{title}</Text>
      <Chip label={badge} active={!danger} danger={danger} small />
      <Text style={styles.panelCopy}>{desc}</Text>
      <View style={styles.actionRow}>
        <Text style={styles.linkMuted}>{selected ? "Viewed" : "View Analysis"}</Text>
        <Text style={styles.linkGreen}>{selected ? "Saved ✓" : "Find Alternatives"}</Text>
      </View>
    </Pressable>
  );
}

function Bottle({ tall, wide, active, onPress }: { tall?: boolean; wide?: boolean; active?: boolean; onPress?: () => void }) {
  const bottle = <View style={[styles.bottle, tall && styles.bottleTall, wide && styles.bottleWide, active && styles.vanityItemActive]} />;
  if (!onPress) {
    return bottle;
  }
  return <Pressable onPress={onPress}>{bottle}</Pressable>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 112 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  roundButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", shadowColor: "#4A443A", shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  roundButtonText: { color: colors.text, fontSize: 22, fontWeight: "800" },
  hidden: { opacity: 0 },
  stepPill: { borderRadius: 999, backgroundColor: colors.sand, paddingHorizontal: 14, paddingVertical: 8 },
  stepPillText: { color: colors.muted, fontSize: 11, fontWeight: "900", letterSpacing: 1.4 },
  whitePanel: { backgroundColor: colors.surface, borderRadius: 32, padding: 24, gap: 22, shadowColor: "#786C5A", shadowOpacity: 0.14, shadowRadius: 28, shadowOffset: { width: 0, height: 16 }, elevation: 3 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 8 },
  logoMark: { width: 50, height: 50, borderRadius: 18, backgroundColor: "#D99AA6", alignItems: "center", justifyContent: "center" },
  logoText: { color: "white", fontSize: 25, fontWeight: "900" },
  panelTitle: { color: colors.text, fontSize: 20, fontWeight: "800", lineHeight: 26 },
  panelCopy: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  field: { gap: 8 },
  label: { color: colors.muted, fontSize: 11, fontWeight: "900", letterSpacing: 1.8 },
  input: { minHeight: 48, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, paddingHorizontal: 14, color: colors.body, backgroundColor: "white" },
  segmentRow: { flexDirection: "row", borderRadius: 999, backgroundColor: "#F3EFE7", padding: 4, gap: 4 },
  segmentWrap: { flexWrap: "wrap", backgroundColor: "transparent", padding: 0 },
  segmentChoice: { flex: 1, minWidth: 74, alignItems: "center", borderRadius: 999, paddingVertical: 9, paddingHorizontal: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: "transparent" },
  segmentChoiceActive: { backgroundColor: "#E0E9DD", borderColor: "#D9E5D6" },
  segmentChoiceText: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  segmentChoiceTextActive: { color: colors.sage, fontWeight: "900" },
  progressWrap: { marginTop: 8, gap: 8 },
  progressText: { color: colors.mutedSoft, fontSize: 11, fontWeight: "900", letterSpacing: 1.4 },
  progressTrack: { height: 3, borderRadius: 999, backgroundColor: colors.sand },
  progressFill: { width: "50%", height: 3, borderRadius: 999, backgroundColor: colors.sage },
  heroBlock: { marginTop: 24, marginBottom: 18, gap: 8 },
  heroTitle: { color: colors.text, fontSize: 29, lineHeight: 35, fontWeight: "900" },
  heroSubtitle: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  kicker: { color: colors.mutedSoft, fontSize: 11, fontWeight: "900", letterSpacing: 2, marginTop: 22, marginBottom: 10 },
  kickerCenter: { color: colors.mutedSoft, fontSize: 11, fontWeight: "900", letterSpacing: 2, textAlign: "center", marginTop: 10, marginBottom: 18 },
  greenKicker: { color: colors.sage, fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  choice: { backgroundColor: colors.surface, borderRadius: 18, padding: 16, marginBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  choiceSelected: { backgroundColor: "rgba(107,142,107,0.07)", borderColor: "rgba(107,142,107,0.22)" },
  choiceTitle: { color: colors.text, fontSize: 17, fontWeight: "900" },
  choiceSubtitle: { color: colors.muted, fontSize: 12, marginTop: 4 },
  radio: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.sand, alignItems: "center", justifyContent: "center" },
  radioSelected: { backgroundColor: colors.sage },
  check: { color: "white", fontWeight: "900" },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { alignSelf: "flex-start", borderRadius: 999, backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 7, shadowColor: "#4A443A", shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  chipActive: { backgroundColor: colors.text },
  chipDanger: { backgroundColor: "rgba(232,159,113,0.12)" },
  chipSmall: { paddingHorizontal: 9, paddingVertical: 5 },
  chipText: { color: colors.text, fontSize: 12, fontWeight: "800" },
  chipTextActive: { color: "white" },
  chipTextDanger: { color: colors.coral },
  centerPage: { minHeight: 560, alignItems: "center", justifyContent: "center", gap: 12 },
  readyMark: { width: 78, height: 78, borderRadius: 39, backgroundColor: colors.sage, color: "white", textAlign: "center", lineHeight: 78, fontSize: 34, fontWeight: "900" },
  spinner: { width: 78, height: 78, borderRadius: 39, borderWidth: 3, borderColor: colors.sand, borderTopColor: colors.sage, alignItems: "center", justifyContent: "center" },
  spinnerInner: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(107,142,107,0.10)" },
  processRow: { width: "86%", flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  processText: { color: colors.mutedSoft, fontSize: 12, fontWeight: "800" },
  processActive: { color: colors.sage },
  microCopy: { color: colors.mutedSoft, fontSize: 10, letterSpacing: 2, marginTop: 20 },
  card: { backgroundColor: colors.surface, borderRadius: 24, padding: 18, gap: 10, marginBottom: 14, shadowColor: "#4A443A", shadowOpacity: 0.10, shadowRadius: 22, shadowOffset: { width: 0, height: 12 }, elevation: 2 },
  cardSelected: { borderWidth: 1, borderColor: "rgba(107,142,107,0.36)", backgroundColor: "#F8FBF6" },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bigTitle: { color: colors.text, fontSize: 25, lineHeight: 31, fontWeight: "900", marginTop: 8 },
  metricRow: { flexDirection: "row", gap: 28, marginTop: 12 },
  metricValue: { color: colors.text, fontSize: 19, fontWeight: "900" },
  metricLabel: { color: colors.muted, fontSize: 11, marginTop: 3 },
  sectionTitle: { color: colors.text, fontSize: 14, fontWeight: "900", marginBottom: 8 },
  avoidTitle: { marginTop: 18 },
  horizontalCards: { flexDirection: "row", gap: 12 },
  productMini: { width: 130, backgroundColor: colors.surface, borderRadius: 18, padding: 12, gap: 4 },
  productMiniSelected: { borderWidth: 1, borderColor: colors.sage, backgroundColor: "#F8FBF6" },
  productIcon: { height: 70, borderRadius: 14, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  productName: { color: colors.text, fontSize: 13, fontWeight: "900" },
  productSub: { color: colors.muted, fontSize: 11 },
  cameraFrame: { minHeight: 620, borderRadius: 30, overflow: "hidden", backgroundColor: "#202A35", alignItems: "center", justifyContent: "center" },
  scanChoice: { flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: colors.surface, borderRadius: 22, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  scanChoiceActive: { borderColor: colors.sage, backgroundColor: "#F8FBF6" },
  scanIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: colors.accentSoft, alignItems: "center", justifyContent: "center" },
  scanIconText: { color: colors.sage, fontSize: 24, fontWeight: "900" },
  scannedImage: { position: "absolute", inset: 0, width: "100%", height: "100%" },
  fakeLabel: { width: 250, minHeight: 260, borderRadius: 8, backgroundColor: "#D8D0BE", padding: 20, justifyContent: "center" },
  fakeLabelLocked: { borderWidth: 2, borderColor: colors.sage },
  fakeLabelTitle: { color: "#5A533F", fontSize: 11, fontWeight: "900", letterSpacing: 2, marginBottom: 10 },
  fakeLabelText: { color: "#3D3727", fontSize: 10, lineHeight: 17 },
  scanBox: { position: "absolute", width: 268, height: 268, borderRadius: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.9)" },
  scanBoxLocked: { borderColor: colors.sage, borderWidth: 3 },
  scanLine: { position: "absolute", left: 14, right: 14, top: 132, height: 2, backgroundColor: colors.sage },
  cameraCaption: { color: "white", fontSize: 12, fontWeight: "800", position: "absolute", bottom: 42 },
  errorText: { color: colors.danger, fontSize: 13, lineHeight: 19, marginTop: 10 },
  gauge: { width: 210, height: 210, borderRadius: 105, borderWidth: 4, borderColor: colors.sage, alignSelf: "center", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.35)" },
  gaugeLabel: { color: colors.mutedSoft, fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  gaugeValue: { color: colors.text, fontSize: 54, fontWeight: "900" },
  gaugePercent: { color: colors.sage, fontSize: 36 },
  centerStatement: { color: colors.text, fontSize: 16, lineHeight: 24, textAlign: "center", fontWeight: "800", marginTop: 18 },
  greenText: { color: colors.sage },
  ingredientRow: { borderRadius: 16, padding: 14, backgroundColor: "rgba(107,142,107,0.08)", flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  ingredientDanger: { backgroundColor: "rgba(232,159,113,0.10)" },
  ingredientTitle: { color: colors.text, fontSize: 14, fontWeight: "900" },
  ingredientSub: { color: colors.muted, fontSize: 11, marginTop: 3 },
  rowBadge: { color: colors.sage, fontSize: 11, fontWeight: "900" },
  rowBadgeDanger: { color: colors.coral },
  inlineAction: { minHeight: 50, borderRadius: 16, borderWidth: 1, borderColor: colors.sage, alignItems: "center", justifyContent: "center", marginTop: 10, backgroundColor: "rgba(107,142,107,0.08)" },
  inlineActionSelected: { backgroundColor: colors.sage },
  inlineActionText: { color: colors.sage, fontSize: 14, fontWeight: "900" },
  inlineActionTextSelected: { color: "white" },
  vanityStage: { alignItems: "center", marginVertical: 10 },
  mirror: { width: 170, height: 205, borderRadius: 90, backgroundColor: "#FFFFFF", borderWidth: 7, borderColor: "#D8B68A" },
  table: { marginTop: -12, width: "100%", height: 110, borderRadius: 18, backgroundColor: "#FBF6EC", borderWidth: StyleSheet.hairlineWidth, borderColor: "#D8B68A", flexDirection: "row", justifyContent: "space-around", alignItems: "flex-end", padding: 14 },
  bottle: { width: 34, height: 58, borderRadius: 8, backgroundColor: colors.sage },
  bottleTall: { width: 28, height: 82, backgroundColor: colors.text },
  bottleWide: { width: 46, height: 48, backgroundColor: colors.text },
  toolCup: { width: 44, height: 38, borderRadius: 9, backgroundColor: "#EFE6D5", borderWidth: 1, borderColor: "#D8B68A" },
  vanityItemActive: { borderWidth: 2, borderColor: colors.sage, shadowColor: colors.sage, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  segmented: { flexDirection: "row", borderRadius: 999, backgroundColor: colors.sand, padding: 4, marginBottom: 20 },
  periodOption: { flex: 1, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  periodOptionActive: { backgroundColor: colors.sage, shadowColor: colors.sage, shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  periodOptionText: { paddingVertical: 10, color: colors.muted, fontWeight: "900" },
  periodOptionTextActive: { color: "white" },
  segmentMuted: { flex: 1, textAlign: "center", paddingVertical: 10, color: colors.muted, fontWeight: "900" },
  segmentActive: { flex: 1, textAlign: "center", paddingVertical: 10, color: "white", fontWeight: "900", backgroundColor: colors.sage, borderRadius: 999 },
  timelineRow: { flexDirection: "row", gap: 12, alignItems: "flex-start", marginBottom: 12 },
  timelineDot: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  timelineDotText: { color: colors.sage, fontSize: 11, fontWeight: "900" },
  timelineCard: { flex: 1, borderRadius: 18, backgroundColor: colors.surface, padding: 14, gap: 8 },
  warningStrip: { marginLeft: 50, borderRadius: 14, padding: 10, backgroundColor: "rgba(232,159,113,0.12)", borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(232,159,113,0.35)", marginBottom: 12 },
  warningStripText: { color: colors.coral, fontSize: 12, fontWeight: "900" },
  actionRow: { flexDirection: "row", gap: 20, marginTop: 4 },
  linkMuted: { color: colors.muted, fontSize: 12, fontWeight: "900" },
  linkGreen: { color: colors.sage, fontSize: 12, fontWeight: "900" },
  footer: { position: "absolute", left: 22, right: 22, bottom: 18, paddingTop: 18, backgroundColor: colors.background },
  primaryButton: { minHeight: 54, borderRadius: 18, backgroundColor: colors.text, alignItems: "center", justifyContent: "center", shadowColor: colors.text, shadowOpacity: 0.24, shadowRadius: 22, shadowOffset: { width: 0, height: 12 }, elevation: 3 },
  primaryButtonDisabled: { opacity: 0.45 },
  primaryButtonText: { color: "white", fontSize: 15, fontWeight: "900" }
});
