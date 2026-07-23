import React, { useState } from "react";
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from "react-native";
import { colors, radius, spacing, typography } from "../utils/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  hint,
  isPassword = false,
  containerStyle,
  ...rest
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
      >
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          {...rest}
        />
        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            style={styles.eyeButton}
            activeOpacity={0.7}
          >
            <Text style={styles.eyeText}>{showPassword ? "Nascondi" : "Mostra"}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  inputFocused: {
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceElevated,
  },
  inputError: {
    borderColor: colors.pass,
  },
  input: {
    flex: 1,
    height: 52,
    ...typography.body,
    color: colors.textPrimary,
  },
  eyeButton: {
    paddingLeft: spacing.sm,
  },
  eyeText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.caption,
    color: colors.pass,
    marginTop: spacing.xs,
  },
  hintText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
