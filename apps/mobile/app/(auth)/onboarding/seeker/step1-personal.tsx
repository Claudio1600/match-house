import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Input } from "../../../../components/Input";
import { Button } from "../../../../components/Button";
import { colors, spacing, typography } from "../../../../utils/theme";

export default function SeekerStep1() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "Inserisci il tuo nome";
    if (!lastName.trim()) e.lastName = "Inserisci il tuo cognome";
    if (!age || isNaN(Number(age)) || Number(age) < 18 || Number(age) > 99)
      e.age = "Età non valida (18-99)";
    setErrors(e);
    return Object.keys(e).length === 0;
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
        >
          <View style={styles.progress}>
            {[1, 2, 3, 4, 5].map((step) => (
              <View
                key={step}
                style={[
                  styles.progressDot,
                  step === 1 && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          <Text style={styles.title}>Chi sei?</Text>
          <Text style={styles.subtitle}>
            Inizia con le tue informazioni personali
          </Text>

          <Input
            label="Nome"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Marco"
            autoComplete="given-name"
            error={errors.firstName}
          />
          <Input
            label="Cognome"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Rossi"
            autoComplete="family-name"
            error={errors.lastName}
          />
          <Input
            label="Età"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            placeholder="25"
            error={errors.age}
          />

          <Button
            label="Avanti"
            onPress={() => {
              if (!validate()) return;
              router.push({
                pathname: "/(auth)/onboarding/seeker/step2-lifestyle",
                params: { firstName, lastName, age },
              });
            }}
            style={styles.button}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: spacing.lg, paddingBottom: spacing.xxl },
  progress: { flexDirection: "row", gap: spacing.xs, marginBottom: spacing.xl },
  progressDot: {
    flex: 1,
    height: 3,
    borderRadius: 999,
    backgroundColor: colors.border,
  },
  progressDotActive: { backgroundColor: colors.textPrimary },
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  button: { marginTop: spacing.lg },
});
