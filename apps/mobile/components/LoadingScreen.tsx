import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { colors, spacing, typography } from "../utils/theme";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.textPrimary} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
