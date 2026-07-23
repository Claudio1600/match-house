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
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Input } from "../../../../components/Input";
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
      <Text
        style={[styles.toggleText, value && styles.toggleTextActive]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function LandlordStep2() {
  const params = useLocalSearchParams<Record<string, string>>();

  const [totalRooms, setTotalRooms] = useState("3");
  const [availableRooms, setAvailableRooms] = useState("1");
  const [currentTenants, setCurrentTenants] = useState("2");
  const [squareMeters, setSquareMeters] = useState("");
  const [floor, setFloor] = useState("");
  const [furnished, setFurnished] = useState(false);
  const [billsIncluded, setBillsIncluded] = useState(false);
  const [wifiIncluded, setWifiIncluded] = useState(true);
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [smokingAllowed, setSmokingAllowed] = useState(false);
  const [parkingAvailable, setParkingAvailable] = useState(false);

  const handleNext = () => {
    router.push({
      pathname: "/(auth)/onboarding/landlord/step3-rules",
      params: {
        ...params,
        totalRooms,
        availableRooms,
        currentTenants,
        squareMeters,
        floor,
        furnished: furnished ? "true" : "false",
        billsIncluded: billsIncluded ? "true" : "false",
        wifiIncluded: wifiIncluded ? "true" : "false",
        petsAllowed: petsAllowed ? "true" : "false",
        smokingAllowed: smokingAllowed ? "true" : "false",
        parkingAvailable: parkingAvailable ? "true" : "false",
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
                  step <= 2 && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          <Text style={styles.title}>Dettagli appartamento</Text>
          <Text style={styles.subtitle}>
            Descrivi le caratteristiche della tua proprietà
          </Text>

          <View style={styles.row}>
            <Input
              label="Stanze totali"
              value={totalRooms}
              onChangeText={setTotalRooms}
              keyboardType="numeric"
              containerStyle={styles.rowInput}
            />
            <Input
              label="Disponibili"
              value={availableRooms}
              onChangeText={setAvailableRooms}
              keyboardType="numeric"
              containerStyle={styles.rowInput}
            />
          </View>
          <View style={styles.row}>
            <Input
              label="Coinquilini attuali"
              value={currentTenants}
              onChangeText={setCurrentTenants}
              keyboardType="numeric"
              containerStyle={styles.rowInput}
            />
            <Input
              label="Piano"
              value={floor}
              onChangeText={setFloor}
              keyboardType="numeric"
              placeholder="T"
              containerStyle={styles.rowInput}
            />
          </View>
          <Input
            label="Superficie (m²)"
            value={squareMeters}
            onChangeText={setSquareMeters}
            keyboardType="numeric"
            placeholder="es. 80"
          />

          <Text style={styles.sectionLabel}>CARATTERISTICHE</Text>
          <View style={styles.toggleGrid}>
            <Toggle
              label="Arredato"
              value={furnished}
              onToggle={() => setFurnished((v) => !v)}
            />
            <Toggle
              label="Spese incluse"
              value={billsIncluded}
              onToggle={() => setBillsIncluded((v) => !v)}
            />
            <Toggle
              label="Wi-Fi incluso"
              value={wifiIncluded}
              onToggle={() => setWifiIncluded((v) => !v)}
            />
            <Toggle
              label="Animali ok"
              value={petsAllowed}
              onToggle={() => setPetsAllowed((v) => !v)}
            />
            <Toggle
              label="Fumatori ok"
              value={smokingAllowed}
              onToggle={() => setSmokingAllowed((v) => !v)}
            />
            <Toggle
              label="Parcheggio"
              value={parkingAvailable}
              onToggle={() => setParkingAvailable((v) => !v)}
            />
          </View>

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
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  rowInput: { flex: 1 },
  sectionLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  toggleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  toggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  toggleActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  toggleText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.background,
  },
  button: { marginTop: spacing.lg },
});
