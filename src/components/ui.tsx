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
  background: "#FAFAFA",
  surface: "#FFFFFF",
  text: "#202124",
  muted: "#5F6368",
  border: "#DADCE0",
  accent: "#146C94",
  accentSoft: "#E8F4F8",
  warning: "#8A5A00",
  warningSoft: "#FFF7DF",
  danger: "#A63446",
  success: "#16794C"
};

export function Screen({ children, title, subtitle }: PropsWithChildren<{ title?: string; subtitle?: string }>) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
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
    padding: 16,
    paddingBottom: 40,
    gap: 12
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginTop: 8
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text
  },
  muted: {
    color: colors.muted
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    padding: 14,
    gap: 8
  },
  button: {
    minHeight: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  primaryButton: {
    backgroundColor: colors.accent
  },
  secondaryButton: {
    backgroundColor: colors.accentSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accent
  },
  dangerButton: {
    backgroundColor: colors.danger
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
    fontWeight: "700",
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
    fontWeight: "700"
  },
  field: {
    gap: 6
  },
  input: {
    minHeight: 46,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    color: colors.text,
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
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 12,
    justifyContent: "center",
    backgroundColor: colors.surface
  },
  optionSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent
  },
  optionText: {
    color: colors.text,
    fontSize: 14
  },
  optionSelectedText: {
    color: colors.accent,
    fontWeight: "700"
  },
  tag: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.accentSoft
  },
  warningTag: {
    backgroundColor: colors.warningSoft
  },
  successTag: {
    backgroundColor: "#E7F4EE"
  },
  tagText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700"
  },
  warningText: {
    color: colors.warning
  },
  successText: {
    color: colors.success
  },
  notice: {
    borderRadius: 8,
    backgroundColor: colors.accentSoft,
    padding: 12
  },
  warningNotice: {
    backgroundColor: colors.warningSoft
  },
  noticeText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19
  }
});
