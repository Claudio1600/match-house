import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Input } from "../../../../components/Input";
import { Button } from "../../../../components/Button";
import { colors, spacing, typography } from "../../../../utils/theme";

export default function LandlordStep1() {
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [rent, setRent] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Inserisci un titolo";
    if (!address.trim()) e.address = "Inserisci l'indirizzo";
    if (!city.trim()) e.city = "Inserisci la città";
    if (!rent || isNaN(Number(rent)) || Number(rent) <= 0)
      e.rent = "Inserisci un affitto valido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    router.push({
      pathname: "/(auth)/onboarding/landlord/step2-details",
      params: {
        title,
        address,
        city,
        rent,
        latitude: "0",
        longitude: "0",
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
                style={[styles.progressDot, step === 1 && styles.progressDotActive]}
              />
            ))}
          </View>

          <Text style={styles.title}>Informazioni base</Text>
          <Text style={styles.subtitle}>
            Inizia con le informazioni principali della tua proprietà
          </Text>

          <Input
            label="Titolo annuncio"
            value={title}
            onChangeText={setTitle}
            placeholder="es. Stanza singola luminosa in centro"
            error={errors.title}
          />
          <Input
            label="Indirizzo"
            value={address}
            onChangeText={setAddress}
            placeholder="Via Roma, 10"
            error={errors.address}
          />
          <Input
            label="Città"
            value={city}
            onChangeText={setCity}
            placeholder="Milano"
            error={errors.city}
          />
          <Input
            label="Affitto mensile (€)"
            value={rent}
            onChangeText={setRent}
            keyboardType="numeric"
            placeholder="650"
            error={errors.rent}
            hint="Escludi o includi le spese nel passo successivo"
          />

          <Button
            label="Avanti"
            onPress={handleNext}
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
  progressDotActive: {
    backgroundColor: colors.textPrimary,
  },
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
  button: {
    marginTop: spacing.lg,
  },
});
