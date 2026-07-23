import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { colors, radius, spacing, typography } from "../utils/theme";

type BadgeVariant = "default" | "smash" | "pass" | "neutral";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ label, variant = "default", style }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant], style]}>
      <Text style={[styles.text, styles[`${variant}Text` as keyof typeof styles] as object]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignSelf: "flex-start",
  },
  text: {
    ...typography.label,
  },
  default: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  defaultText: {
    color: colors.textSecondary,
  },
  smash: {
    backgroundColor: colors.smashBg,
  },
  smashText: {
    color: colors.smash,
  },
  pass: {
    backgroundColor: colors.passBg,
  },
  passText: {
    color: colors.pass,
  },
  neutral: {
    backgroundColor: colors.surface,
  },
  neutralText: {
    color: colors.textMuted,
  },
});
