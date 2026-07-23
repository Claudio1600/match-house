import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "../../../../components/Button";
import { colors, radius, spacing, typography } from "../../../../utils/theme";

export default function LandlordStep3() {
  const params = useLocalSearchParams<Record<string, string>>();
  const [description, setDescription] = useState("");
  const [houseRules, setHouseRules] = useState("");
  const [neighborhoodInfo, setNeighborhoodInfo] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!description.trim() || description.length < 20)
      e.description = "Inserisci una descrizione di almeno 20 caratteri";
    if (!availableFrom.trim()) e.availableFrom = "Inserisci la data";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    router.push({
      pathname: "/(auth)/onboarding/landlord/step4-photos",
      params: {
        ...params,
        description,
        houseRules,
        neighborhoodInfo,
        availableFrom,
      },
    });
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
          <View style={styles.progress}>
            {[1, 2, 3, 4].map((step) => (
              <View
                key={step}
                style={[
                  styles.progressDot,
                  step <= 3 && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          <Text style={styles.title}>Descrizione e regole</Text>
          <Text style={styles.subtitle}>
            Racconta la tua casa e definisci le regole per i coinquilini
          </Text>

          <Text style={styles.fieldLabel}>DISPONIBILE DAL *</Text>
          <TextInput
            style={[styles.textInput, errors.availableFrom ? styles.inputError : null]}
            value={availableFrom}
            onChangeText={setAvailableFrom}
            placeholder="YYYY-MM-DD (es. 2025-02-01)"
            placeholderTextColor={colors.textMuted}
          />
          {errors.availableFrom ? (
            <Text style={styles.errorText}>{errors.availableFrom}</Text>
          ) : null}

          <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>
            DESCRIZIONE *
          </Text>
          <TextInput
            style={[
              styles.textArea,
              errors.description ? styles.inputError : null,
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Racconta tutto sull'appartamento, la zona, l'atmosfera..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          {errors.description ? (
            <Text style={styles.errorText}>{errors.description}</Text>
          ) : null}

          <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>
            REGOLE DI CASA (opzionale)
          </Text>
          <TextInput
            style={styles.textArea}
            value={houseRules}
            onChangeText={setHouseRules}
            placeholder="No feste, pulizie a rotazione..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>
            INFO ZONA (opzionale)
          </Text>
          <TextInput
            style={styles.textArea}
            value={neighborhoodInfo}
            onChangeText={setNeighborhoodInfo}
            placeholder="Metro a 5 minuti, supermercato sotto casa..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Button label="Avanti" onPress={handleNext} style={styles.button} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  progress: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  progressDot: {
    flex: 1,
    height: 3,
    borderRadius: 999,
    backgroundColor: colors.border,
  },
  progressDotActive: { backgroundColor: colors.textPrimary },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    height: 52,
    marginBottom: spacing.xs,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 100,
    marginBottom: spacing.xs,
  },
  inputError: {
    borderColor: colors.pass,
  },
  errorText: {
    ...typography.caption,
    color: colors.pass,
    marginBottom: spacing.sm,
  },
  button: { marginTop: spacing.lg },
});
