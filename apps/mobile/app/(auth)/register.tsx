import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { colors, radius, spacing, typography } from "../../utils/theme";
import { UserType } from "../../types";

export default function RegisterScreen() {
  const params = useLocalSearchParams<{ userType?: string }>();
  const userType: UserType =
    params.userType === "LANDLORD" ? "LANDLORD" : "SEEKER";

  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = "Inserisci la tua email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Email non valida";
    if (!password) newErrors.password = "Inserisci una password";
    else if (password.length < 8)
      newErrors.password = "Minimo 8 caratteri";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Le password non coincidono";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(email.trim().toLowerCase(), password, userType);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registrazione fallita";
      Alert.alert("Errore", message);
    } finally {
      setLoading(false);
    }
  };

  const roleLabel =
    userType === "LANDLORD" ? "Proprietario" : "Cerca stanza";

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.back}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>← Indietro</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Crea il tuo account</Text>

          {/* Role badge */}
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{roleLabel}</Text>
          </View>

          <Text style={styles.subtitle}>
            {userType === "LANDLORD"
              ? "Pubblica la tua stanza e trova il coinquilino ideale"
              : "Trova la stanza perfetta per te"}
          </Text>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoComplete="email"
              placeholder="nome@esempio.com"
              error={errors.email}
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              isPassword
              autoComplete="new-password"
              placeholder="Minimo 8 caratteri"
              error={errors.password}
            />
            <Input
              label="Conferma password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              autoComplete="new-password"
              placeholder="Ripeti la password"
              error={errors.confirmPassword}
              onSubmitEditing={handleRegister}
              returnKeyType="done"
            />

            <Button
              label="Crea account"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Hai già un account?</Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/login")}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLink}>Accedi</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.terms}>
            Continuando accetti i Termini di servizio e l'Informativa sulla
            privacy di Match House.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  back: {
    marginBottom: spacing.xl,
  },
  backText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  roleBadgeText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.xs,
  },
  registerButton: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  loginLink: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  terms: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.lg,
    lineHeight: 18,
  },
});
