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
import { router } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { colors, spacing, typography } from "../../utils/theme";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = "Inserisci la tua email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Email non valida";
    if (!password) newErrors.password = "Inserisci la password";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Credenziali non valide";
      Alert.alert("Errore di accesso", message);
    } finally {
      setLoading(false);
    }
  };

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
          {/* Back */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.back}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>← Indietro</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Bentornato</Text>
          <Text style={styles.subtitle}>
            Accedi al tuo account Match House
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
              autoComplete="password"
              placeholder="La tua password"
              error={errors.password}
              onSubmitEditing={handleLogin}
              returnKeyType="done"
            />

            <Button
              label="Accedi"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Non hai un account?</Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/welcome")}
              activeOpacity={0.7}
            >
              <Text style={styles.registerLink}>Registrati</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  form: {
    flex: 1,
    gap: spacing.xs,
  },
  loginButton: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xxl,
    gap: spacing.xs,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  registerLink: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});
