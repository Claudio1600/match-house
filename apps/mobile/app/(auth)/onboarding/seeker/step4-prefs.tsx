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
import { router, useLocalSearchParams } from "expo-router";
import { Input } from "../../../../components/Input";
import { Button } from "../../../../components/Button";
import { colors, spacing, typography } from "../../../../utils/theme";

export default function SeekerStep4() {
  const params = useLocalSearchParams<Record<string, string>>();
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [preferredCity, setPreferredCity] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (budgetMin && budgetMax && Number(budgetMin) > Number(budgetMax))
      e.budgetMax = "Il budget massimo deve essere maggiore del minimo";
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
                style={[styles.progressDot, step <= 4 && styles.progressDotActive]}
              />
            ))}
          </View>

          <Text style={styles.title}>Le tue preferenze</Text>
          <Text style={styles.subtitle}>
            Dove stai cercando e qual è il tuo budget?
          </Text>

          <View style={styles.row}>
            <Input
              label="Budget min (€)"
              value={budgetMin}
              onChangeText={setBudgetMin}
              keyboardType="numeric"
              placeholder="300"
              containerStyle={styles.rowInput}
            />
            <Input
              label="Budget max (€)"
              value={budgetMax}
              onChangeText={setBudgetMax}
              keyboardType="numeric"
              placeholder="800"
              error={errors.budgetMax}
              containerStyle={styles.rowInput}
            />
          </View>

          <Input
            label="Città preferita"
            value={preferredCity}
            onChangeText={setPreferredCity}
            placeholder="Milano"
          />
          <Input
            label="Data di ingresso desiderata"
            value={moveInDate}
            onChangeText={setMoveInDate}
            placeholder="YYYY-MM-DD"
            hint="Lascia vuoto se flessibile"
          />

          <Button
            label="Avanti"
            onPress={() => {
              if (!validate()) return;
              router.push({
                pathname: "/(auth)/onboarding/seeker/step5-photos",
                params: {
                  ...params,
                  budgetMin,
                  budgetMax,
                  preferredCity,
                  moveInDate,
                },
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
  progressDot: { flex: 1, height: 3, borderRadius: 999, backgroundColor: colors.border },
  progressDotActive: { backgroundColor: colors.textPrimary },
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  row: { flexDirection: "row", gap: spacing.md },
  rowInput: { flex: 1 },
  button: { marginTop: spacing.lg },
});
