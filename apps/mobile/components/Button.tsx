import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { colors, radius, spacing, typography } from "../utils/theme";

type Variant = "primary" | "secondary" | "ghost" | "smash" | "pass";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = true,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "secondary" || variant === "ghost"
              ? colors.textPrimary
              : colors.background
          }
        />
      ) : (
        <Text
          style={[
            styles.label,
            styles[`${variant}Text` as keyof typeof styles] as TextStyle,
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    ...typography.body,
    fontWeight: "500",
  },
  // Variants
  primary: {
    backgroundColor: colors.accent,
  },
  primaryText: {
    color: colors.background,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: {
    color: colors.textPrimary,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  ghostText: {
    color: colors.textPrimary,
  },
  smash: {
    backgroundColor: colors.smash,
  },
  smashText: {
    color: colors.background,
  },
  pass: {
    backgroundColor: colors.pass,
  },
  passText: {
    color: colors.background,
  },
});
