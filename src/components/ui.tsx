import { PropsWithChildren } from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const colors = {
  background: "#FAF7F2",
  surface: "#FFFFFF",
  text: "#2F4F4F",
  body: "#4A443A",
  muted: "#8B7E6E",
  mutedSoft: "#B8AC9D",
  border: "#E6E2DA",
  accent: "#2F4F4F",
  accentSoft: "#EEF4EE",
  sage: "#6B8E6B",
  coral: "#E89F71",
  warning: "#9A6A38",
  warningSoft: "#FFF4E8",
  danger: "#B95E53",
  success: "#5E805F",
  successSoft: "#EAF2EA",
  sand: "#ECE6DA"
};

export function Screen({ children, title, subtitle, eyebrow }: PropsWithChildren<{ title?: string; subtitle?: string; eyebrow?: string }>) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {(title || subtitle || eyebrow) ? (
          <View style={styles.hero}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        ) : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Button({
  title,
  variant = "primary",
  disabled,
  loading,
  style,
  textStyle,
  ...props
}: PressableProps & {
  title: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  const buttonStyle = [
    styles.button,
    variant === "primary" && styles.primaryButton,
    variant === "secondary" && styles.secondaryButton,
    variant === "danger" && styles.dangerButton,
    variant === "ghost" && styles.ghostButton,
    disabled && styles.disabledButton,
    style
  ];
  const labelStyle = [
    styles.buttonText,
    variant === "secondary" && styles.secondaryButtonText,
    variant === "ghost" && styles.ghostButtonText,
    textStyle
  ];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel ?? title}
      disabled={disabled || loading}
      style={({ pressed }) => [buttonStyle, pressed && !disabled ? styles.pressed : null]}
      {...props}
    >
      {loading ? <ActivityIndicator color={variant === "secondary" || variant === "ghost" ? colors.accent : "#FFFFFF"} /> : <Text style={labelStyle}>{title}</Text>}
    </Pressable>
  );
}

export function Card({ children, style, testID }: PropsWithChildren<{ style?: StyleProp<ViewStyle>; testID?: string }>) {
  return (
    <View testID={testID} style={[styles.card, style]}>
      {children}
    </View>
  );
}

export function Label({ children }: PropsWithChildren) {
  return <Text style={styles.label}>{children}</Text>;
}

export function BodyText({ children, muted = false }: PropsWithChildren<{ muted?: boolean }>) {
  return <Text style={[styles.body, muted && styles.muted]}>{children}</Text>;
}

export function SectionTitle({ children }: PropsWithChildren) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function MetricCard({ label, value, caption }: { label: string; value: string; caption?: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      {caption ? <Text style={styles.metricCaption}>{caption}</Text> : null}
    </View>
  );
}

export function Tag({ children, tone = "default" }: PropsWithChildren<{ tone?: "default" | "warning" | "success" }>) {
  return (
    <View style={[styles.tag, tone === "warning" && styles.warningTag, tone === "success" && styles.successTag]}>
      <Text style={[styles.tagText, tone === "warning" && styles.warningText, tone === "success" && styles.successText]}>{children}</Text>
    </View>
  );
}

export function OptionRow({ children }: PropsWithChildren) {
  return <View style={styles.optionRow}>{children}</View>;
}

export function OptionButton({
  selected,
  title,
  disabled,
  ...props
}: PressableProps & {
  selected: boolean;
  title: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel ?? title}
      disabled={disabled}
      style={({ pressed }) => [styles.option, selected && styles.optionSelected, disabled && styles.disabledButton, pressed ? styles.pressed : null]}
      {...props}
    >
      <Text style={[styles.optionText, selected && styles.optionSelectedText]}>{title}</Text>
    </Pressable>
  );
}

export function TextField(props: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={styles.field}>
      <Label>{props.label}</Label>
      <TextInput
        {...props}
        accessibilityLabel={props.accessibilityLabel ?? props.label}
        placeholderTextColor="#8A8F94"
        style={[styles.input, props.multiline && styles.textArea, props.style]}
      />
      {props.error ? <Text style={styles.errorText}>{props.error}</Text> : null}
    </View>
  );
}

export function Notice({ children, tone = "default" }: PropsWithChildren<{ tone?: "default" | "warning" }>) {
  return (
    <View style={[styles.notice, tone === "warning" && styles.warningNotice]}>
      <Text style={[styles.noticeText, tone === "warning" && styles.warningText]}>{children}</Text>
    </View>
  );
}

export function InlineError({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }
  return <Text style={styles.errorText}>{message}</Text>;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  scroll: {
    padding: 18,
    paddingBottom: 44,
    gap: 14
  },
  hero: {
    paddingTop: 6,
    paddingBottom: 8,
    gap: 8
  },
  eyebrow: {
    color: colors.mutedSoft,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.8,
    textTransform: "uppercase"
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
    color: colors.text,
    letterSpacing: -0.2
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    marginTop: 4
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.body
  },
  muted: {
    color: colors.muted
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: "rgba(230, 226, 218, 0.92)",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    padding: 16,
    gap: 10,
    shadowColor: "#4A443A",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2
  },
  button: {
    minHeight: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  primaryButton: {
    backgroundColor: colors.accent
  },
  secondaryButton: {
    backgroundColor: colors.accentSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(107, 142, 107, 0.24)"
  },
  dangerButton: {
    backgroundColor: colors.coral
  },
  ghostButton: {
    backgroundColor: "transparent"
  },
  disabledButton: {
    opacity: 0.45
  },
  pressed: {
    opacity: 0.78
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center"
  },
  secondaryButtonText: {
    color: colors.accent
  },
  ghostButtonText: {
    color: colors.accent
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800"
  },
  field: {
    gap: 6
  },
  input: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.82)",
    color: colors.body,
    fontSize: 15
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top"
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  option: {
    minHeight: 44,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 12,
    justifyContent: "center",
    backgroundColor: colors.surface
  },
  optionSelected: {
    backgroundColor: "rgba(107, 142, 107, 0.10)",
    borderColor: colors.sage
  },
  optionText: {
    color: colors.text,
    fontSize: 14
  },
  optionSelectedText: {
    color: colors.text,
    fontWeight: "800"
  },
  tag: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.accentSoft
  },
  warningTag: {
    backgroundColor: colors.warningSoft
  },
  successTag: {
    backgroundColor: colors.successSoft
  },
  tagText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "800"
  },
  warningText: {
    color: colors.warning
  },
  successText: {
    color: colors.success
  },
  notice: {
    borderRadius: 16,
    backgroundColor: colors.accentSoft,
    padding: 13,
    borderColor: "rgba(107, 142, 107, 0.14)",
    borderWidth: StyleSheet.hairlineWidth
  },
  warningNotice: {
    backgroundColor: colors.warningSoft
  },
  noticeText: {
    color: colors.body,
    fontSize: 13,
    lineHeight: 19
  },
  metricCard: {
    borderRadius: 18,
    padding: 16,
    gap: 6,
    backgroundColor: "rgba(107, 142, 107, 0.08)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(107, 142, 107, 0.18)"
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  metricValue: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 38
  },
  metricCaption: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  }
});
