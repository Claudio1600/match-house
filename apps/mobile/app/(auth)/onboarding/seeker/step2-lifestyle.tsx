import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "../../../../components/Button";
import { colors, radius, spacing, typography } from "../../../../utils/theme";

interface ToggleProps {
  label: string;
  value: boolean;
  onToggle: () => void;
}

function Toggle({ label, value, onToggle }: ToggleProps) {
  return (
    <TouchableOpacity
      style={[styles.toggle, value && styles.toggleActive]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <Text style={[styles.toggleText, value && styles.toggleTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const HOBBY_OPTIONS = [
  "Musica", "Cinema", "Cucina", "Lettura", "Viaggi",
  "Gaming", "Arte", "Fotografia", "Serie TV", "Yoga",
];
const SPORT_OPTIONS = [
  "Calcio", "Basket", "Tennis", "Ciclismo", "Corsa",
  "Palestra", "Nuoto", "Arrampicata", "Padel", "Yoga",
];

export default function SeekerStep2() {
  const params = useLocalSearchParams<Record<string, string>>();
  const [smoker, setSmoker] = useState(false);
  const [hasPets, setHasPets] = useState(false);
  const [cleanliness, setCleanliness] = useState(3);
  const [noiseLevel, setNoiseLevel] = useState(2);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);

  const toggleHobby = (h: string) =>
    setSelectedHobbies((prev) =>
      prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]
    );
  const toggleSport = (s: string) =>
    setSelectedSports((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progress}>
          {[1, 2, 3, 4, 5].map((step) => (
            <View
              key={step}
              style={[
                styles.progressDot,
                step <= 2 && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        <Text style={styles.title}>Il tuo stile di vita</Text>
        <Text style={styles.subtitle}>
          Aiuta i proprietari a conoscerti meglio
        </Text>

        <Text style={styles.sectionLabel}>ABITUDINI</Text>
        <View style={styles.toggleRow}>
          <Toggle label="Fumatore" value={smoker} onToggle={() => setSmoker((v) => !v)} />
          <Toggle label="Ho animali" value={hasPets} onToggle={() => setHasPets((v) => !v)} />
        </View>

        <Text style={styles.sectionLabel}>PULIZIA (1-5)</Text>
        <View style={styles.scaleRow}>
          {[1, 2, 3, 4, 5].map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.scaleBtn, cleanliness === v && styles.scaleBtnActive]}
              onPress={() => setCleanliness(v)}
            >
              <Text
                style={[styles.scaleBtnText, cleanliness === v && styles.scaleBtnTextActive]}
              >
                {v}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>RUMORE (1-5)</Text>
        <View style={styles.scaleRow}>
          {[1, 2, 3, 4, 5].map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.scaleBtn, noiseLevel === v && styles.scaleBtnActive]}
              onPress={() => setNoiseLevel(v)}
            >
              <Text
                style={[styles.scaleBtnText, noiseLevel === v && styles.scaleBtnTextActive]}
              >
                {v}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>HOBBY</Text>
        <View style={styles.chipGrid}>
          {HOBBY_OPTIONS.map((h) => (
            <TouchableOpacity
              key={h}
              style={[styles.chip, selectedHobbies.includes(h) && styles.chipActive]}
              onPress={() => toggleHobby(h)}
            >
              <Text
                style={[styles.chipText, selectedHobbies.includes(h) && styles.chipTextActive]}
              >
                {h}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>SPORT</Text>
        <View style={styles.chipGrid}>
          {SPORT_OPTIONS.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, selectedSports.includes(s) && styles.chipActive]}
              onPress={() => toggleSport(s)}
            >
              <Text
                style={[styles.chipText, selectedSports.includes(s) && styles.chipTextActive]}
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          label="Avanti"
          onPress={() =>
            router.push({
              pathname: "/(auth)/onboarding/seeker/step3-work",
              params: {
                ...params,
                smoker: smoker ? "true" : "false",
                hasPets: hasPets ? "true" : "false",
                cleanliness: String(cleanliness),
                noiseLevel: String(noiseLevel),
                hobbies: selectedHobbies.join(","),
                sports: selectedSports.join(","),
              },
            })
          }
          style={styles.button}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: spacing.lg, paddingBottom: spacing.xxl },
  progress: { flexDirection: "row", gap: spacing.xs, marginBottom: spacing.xl },
  progressDot: {
    flex: 1, height: 3, borderRadius: 999, backgroundColor: colors.border,
  },
  progressDotActive: { backgroundColor: colors.textPrimary },
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  sectionLabel: { ...typography.label, color: colors.textMuted, marginBottom: spacing.sm, marginTop: spacing.md },
  toggleRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm },
  toggle: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  toggleActive: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  toggleText: { ...typography.label, color: colors.textSecondary },
  toggleTextActive: { color: colors.background },
  scaleRow: { flexDirection: "row", gap: spacing.sm },
  scaleBtn: {
    width: 44, height: 44, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface, alignItems: "center", justifyContent: "center",
  },
  scaleBtnActive: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  scaleBtnText: { ...typography.body, color: colors.textSecondary },
  scaleBtnTextActive: { color: colors.background },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  chipText: { ...typography.label, color: colors.textSecondary },
  chipTextActive: { color: colors.background },
  button: { marginTop: spacing.xl },
});
