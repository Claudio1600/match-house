import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Input } from "../../../../components/Input";
import { Button } from "../../../../components/Button";
import { colors, radius, spacing, typography } from "../../../../utils/theme";

const LANGUAGE_OPTIONS = ["Italiano", "Inglese", "Spagnolo", "Francese", "Tedesco", "Arabo", "Cinese", "Portoghese"];
const SCHEDULE_OPTIONS = ["Mattiniero", "Notturno", "Flessibile", "9-18", "Smart working"];

export default function SeekerStep3() {
  const params = useLocalSearchParams<Record<string, string>>();
  const [occupation, setOccupation] = useState("");
  const [university, setUniversity] = useState("");
  const [company, setCompany] = useState("");
  const [bio, setBio] = useState("");
  const [schedule, setSchedule] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["Italiano"]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleLanguage = (l: string) =>
    setSelectedLanguages((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]
    );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!occupation.trim()) e.occupation = "Inserisci la tua occupazione";
    if (!bio.trim() || bio.length < 20)
      e.bio = "Scrivi qualcosa su di te (almeno 20 caratteri)";
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
                style={[styles.progressDot, step <= 3 && styles.progressDotActive]}
              />
            ))}
          </View>

          <Text style={styles.title}>Lavoro e bio</Text>
          <Text style={styles.subtitle}>Raccontaci di più su di te</Text>

          <Input
            label="Occupazione *"
            value={occupation}
            onChangeText={setOccupation}
            placeholder="es. Studente, Sviluppatore, Designer..."
            error={errors.occupation}
          />
          <Input
            label="Università (se studente)"
            value={university}
            onChangeText={setUniversity}
            placeholder="Politecnico di Milano"
          />
          <Input
            label="Azienda (se lavoratore)"
            value={company}
            onChangeText={setCompany}
            placeholder="Accenture, freelance..."
          />

          <Text style={styles.fieldLabel}>BIO *</Text>
          <TextInput
            style={[styles.textArea, errors.bio ? styles.inputError : null]}
            value={bio}
            onChangeText={setBio}
            placeholder="Presentati: cosa ami fare, come sei come coinquilino..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.bio ? <Text style={styles.errorText}>{errors.bio}</Text> : null}

          <Text style={styles.sectionLabel}>ORARI (opzionale)</Text>
          <View style={styles.chipGrid}>
            {SCHEDULE_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, schedule === s && styles.chipActive]}
                onPress={() => setSchedule((prev) => (prev === s ? "" : s))}
              >
                <Text style={[styles.chipText, schedule === s && styles.chipTextActive]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>LINGUE</Text>
          <View style={styles.chipGrid}>
            {LANGUAGE_OPTIONS.map((l) => (
              <TouchableOpacity
                key={l}
                style={[styles.chip, selectedLanguages.includes(l) && styles.chipActive]}
                onPress={() => toggleLanguage(l)}
              >
                <Text
                  style={[styles.chipText, selectedLanguages.includes(l) && styles.chipTextActive]}
                >
                  {l}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            label="Avanti"
            onPress={() => {
              if (!validate()) return;
              router.push({
                pathname: "/(auth)/onboarding/seeker/step4-prefs",
                params: {
                  ...params,
                  occupation,
                  university,
                  company,
                  bio,
                  schedule,
                  languages: selectedLanguages.join(","),
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
  fieldLabel: { ...typography.label, color: colors.textMuted, marginBottom: spacing.xs },
  sectionLabel: { ...typography.label, color: colors.textMuted, marginBottom: spacing.sm, marginTop: spacing.md },
  textArea: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md,
    ...typography.body, color: colors.textPrimary, minHeight: 100, marginBottom: spacing.xs,
  },
  inputError: { borderColor: colors.pass },
  errorText: { ...typography.caption, color: colors.pass, marginBottom: spacing.sm },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  chipText: { ...typography.label, color: colors.textSecondary },
  chipTextActive: { color: colors.background },
  button: { marginTop: spacing.xl },
});
